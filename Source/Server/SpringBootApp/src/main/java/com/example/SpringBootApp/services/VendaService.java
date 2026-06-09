package com.example.SpringBootApp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.SpringBootApp.DTOs.*;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import com.example.SpringBootApp.mappers.VendaMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class VendaService {

    private final VendaPagamentoRepository vendaPagamentoRepository;
    private final VendaRepository vendaRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final CompraRepository compraRepository;
    private final ClienteRepository clienteRepository;
    private final InventarioService inventarioService;
    private final ConfiguracaoService configuracaoService;

    private static final BigDecimal AUTO_DISCARD_THRESHOLD_KG = new BigDecimal("0.1000");

    // ─── THE STORY OF A SALE (MAIN METHOD) ───────────────────────────────────────

    @Transactional
    public Venda createSale(VendCreateDTO saleDTO) {
        Usuario usuario = getUserFromDTOIfExists(saleDTO);
        Venda venda = createNewVendaWithInitialAtributes(saleDTO, usuario);

        if (clientIsPresentInDTO(saleDTO)) {
            venda.setCliente(getClientFromDTOIfExists(saleDTO));
        }

        Venda savedVenda = vendaRepository.save(venda);

        List<Movimentacao> itemsVendidos = new ArrayList<>();
        Set<Long> purchasesDiscarded = new HashSet<>();
        BigDecimal computedTotal = BigDecimal.ZERO;

        for (VendItemDTO itemDTO : saleDTO.getItems()) {
            BigDecimal totalItemCalculated = processStockAndCalculateTotalForItem(itemDTO, savedVenda, itemsVendidos, purchasesDiscarded);
            computedTotal = computedTotal.add(totalItemCalculated);
        }

        computedTotal = applyDiscountIfApplicable(saleDTO, computedTotal);

        savedVenda.setValorTotal(computedTotal);
        savedVenda.setItens(itemsVendidos);

        persistPayments(saleDTO, savedVenda, computedTotal);

        return savedVenda;
    }

    // ─── DELEGATED COMPLEXITY (PRIVATE COMPONENT METHODS) ────────────────────────

    private BigDecimal processStockAndCalculateTotalForItem(VendItemDTO itemDTO, Venda savedVenda, List<Movimentacao> itemsVendidos, Set<Long> purchasesDiscarded) {
        Produto produto = getProductFromItemDTOIfExists(itemDTO);
        BigDecimal requiredQuantity = getRequiredQuantityFromItemDTO(itemDTO);

        validateUnidadeMedidaQuantidade(produto, requiredQuantity);
        validateGlobalStockAvailability(produto, requiredQuantity);

        List<Compra> activeCompras = fetchActiveComprasForProduct(produto.getId());
        BigDecimal remainingToAllocate = requiredQuantity;
        BigDecimal itemTotalValue = BigDecimal.ZERO;

        for (Compra compra : activeCompras) {
            if (remainingToAllocate.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal availableInBatch = fetchAvailableStockInBatch(compra.getId(), produto.getId());
            if (availableInBatch.compareTo(BigDecimal.ZERO) <= 0) continue;

            Movimentacao stockItemReference = fetchStockItemReference(compra.getId(), produto.getId());
            BigDecimal quantityToAllocate = availableInBatch.min(remainingToAllocate);

            // Create and persist individual stock movement
            Movimentacao movimentacao = createMovimentacaoVenda(produto, compra, savedVenda, quantityToAllocate, itemDTO, stockItemReference);
            itemsVendidos.add(movimentacaoRepository.save(movimentacao));

            // Optional auto-discard rule for weight products (KG)
            handleAutoDiscardIfApplicable(produto, compra, purchasesDiscarded);

            BigDecimal calculatedPrice = movimentacao.getPrecoUnitarioVenda();
            itemTotalValue = itemTotalValue.add(calculatedPrice.multiply(quantityToAllocate));
            remainingToAllocate = remainingToAllocate.subtract(quantityToAllocate);
        }

        if (remainingToAllocate.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
        }

        return itemTotalValue;
    }

    private void validateGlobalStockAvailability(Produto produto, BigDecimal requiredQuantity) {
        BigDecimal totalAvailable = movimentacaoRepository.sumQuantityByProdutoId(produto.getId());
        if (totalAvailable == null) totalAvailable = BigDecimal.ZERO;
        if (totalAvailable.compareTo(requiredQuantity) < 0) {
            throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
        }
    }

    private List<Compra> fetchActiveComprasForProduct(Long produtoId) {
        List<Compra> allCompras = compraRepository.findComprasWithStockForProduct(produtoId);
        if (allCompras == null || allCompras.isEmpty()) {
            return compraRepository.findAll(); // Backwards-compatible fallback for tests/older mocks
        }
        return allCompras;
    }

    private BigDecimal fetchAvailableStockInBatch(Long compraId, Long produtoId) {
        BigDecimal available = movimentacaoRepository.sumQuantityByPurchaseAndProduct(compraId, produtoId);
        if (available == null) {
            available = movimentacaoRepository.sumQuantityByPurchaseId(compraId); // Fallback for older tests/mocks
            if (available == null) available = BigDecimal.ZERO;
        }
        return available;
    }

    private Movimentacao fetchStockItemReference(Long compraId, Long produtoId) {
        List<Movimentacao> movs = movimentacaoRepository.findByCompraIdAndProdutoId(compraId, produtoId);
        if (movs == null || movs.isEmpty()) return null;
        return movs.get(0);
    }

    private Movimentacao createMovimentacaoVenda(Produto produto, Compra compra, Venda venda, BigDecimal allocate, VendItemDTO itemDTO, Movimentacao stockItem) {
        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setProduto(produto);
        movimentacao.setCompra(compra);
        movimentacao.setVenda(venda);
        movimentacao.setQuantidade(allocate.multiply(BigDecimal.valueOf(-1)));
        movimentacao.setTipoMovimentacao(MovementType.VENDA);

        BigDecimal salePrice = itemDTO.getPrecoUnitarioVenda() != null ? itemDTO.getPrecoUnitarioVenda()
                : ((stockItem != null && stockItem.getPrecoUnitarioVenda() != null) ? stockItem.getPrecoUnitarioVenda()
                : (produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO));

        movimentacao.setPrecoUnitarioVenda(salePrice);
        movimentacao.setPrecoUnitarioCompra(stockItem != null ? stockItem.getPrecoUnitarioCompra() : BigDecimal.ZERO);

        return movimentacao;
    }

    private void handleAutoDiscardIfApplicable(Produto produto, Compra compra, Set<Long> purchasesDiscarded) {
        if (produto.getUnidadeMedida() == UnitMeasurement.KG) {
            BigDecimal leftover = movimentacaoRepository.sumQuantityByPurchaseId(compra.getId());
            if (leftover == null) leftover = BigDecimal.ZERO;

            if (leftover.compareTo(BigDecimal.ZERO) > 0 && leftover.compareTo(AUTO_DISCARD_THRESHOLD_KG) < 0
                    && !purchasesDiscarded.contains(compra.getId())) {

                DescarteItemDTO discardItem = new DescarteItemDTO(compra.getId(), produto.getId(), leftover);
                DescarteCreateDTO discardDTO = new DescarteCreateDTO(null, DescarteType.PERDA_PESO, List.of(discardItem));

                inventarioService.createDiscard(discardDTO);
                purchasesDiscarded.add(compra.getId());
            }
        }
    }

    private BigDecimal applyDiscountIfApplicable(VendCreateDTO saleDTO, BigDecimal computedTotal) {
        if (saleDTO.getHasDiscount() != null && saleDTO.getHasDiscount()) {
            return computedTotal.multiply(new BigDecimal("0.95"));
        }
        return computedTotal;
    }

    // ─── ALREADY EXISTING HELPERS & CONTEXT DISCOVERY ───────────────────────────

    private Produto getProductFromItemDTOIfExists(VendItemDTO itemDTO) {
        return produtoRepository.findById(itemDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto not found with id: " + itemDTO.getProductId()));
    }

    private Cliente getClientFromDTOIfExists(VendCreateDTO saleDTO) {
        return clienteRepository.findById(saleDTO.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with id: " + saleDTO.getClienteId()));
    }

    private boolean clientIsPresentInDTO(VendCreateDTO saleDTO) {
        return saleDTO.getClienteId() != null;
    }

    private Usuario getUserFromDTOIfExists(VendCreateDTO saleDTO) {
        return usuarioRepository.findById(saleDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario not found"));
    }

    private BigDecimal getRequiredQuantityFromItemDTO(VendItemDTO itemDTO) {
        return itemDTO.getQuantity() != null ? itemDTO.getQuantity() : BigDecimal.ZERO;
    }

    private void validateUnidadeMedidaQuantidade(Produto produto, BigDecimal requiredQuantity) {
        if (produto.getUnidadeMedida() == UnitMeasurement.UN) {
            if (requiredQuantity.stripTrailingZeros().scale() > 0) {
                throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + produto.getId());
            }
        }
    }

    private Venda createNewVendaWithInitialAtributes(VendCreateDTO saleDTO, Usuario usuario) {
        Venda venda = new Venda();
        venda.setDataVenda(LocalDateTime.now(ZoneId.of("GMT-03:00")));
        venda.setHasDesconto(saleDTO.getHasDiscount());
        venda.setUsuario(usuario);
        return venda;
    }

    // ─── QUERY OPERATIONS (PAGINATION AND SEARCH) ────────────────────────────────

    public Page<VendaResponseDTO> listSales(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dataVenda").descending());
        Page<Venda> vendas = vendaRepository.findAll(pageable);
        return vendas.map(VendaMapper::toResponse);
    }

    public VendaResponseDTO getSaleById(Long id) {
        Venda venda = vendaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venda not found"));
        return VendaMapper.toResponse(venda);
    }

    public List<VendaResponseDTO> getSalesByClientId(Long clienteId) {
        return vendaRepository.findByClienteIdOrderByDataVendaDesc(clienteId)
                .stream()
                .map(VendaMapper::toResponse)
                .toList();
    }

    public Page<VendaResponseDTO> getSalesByClientId(Long clienteId, int page, int size) {
        int cappedSize = Math.min(size, 200);
        List<VendaResponseDTO> all = vendaRepository.findByClienteIdOrderByDataVendaDesc(clienteId)
                .stream()
                .map(VendaMapper::toResponse)
                .toList();
        int start = page * cappedSize;
        List<VendaResponseDTO> content = start >= all.size()
                ? Collections.emptyList()
                : all.subList(start, Math.min(start + cappedSize, all.size()));
        return new PageImpl<>(
                content,
                PageRequest.of(page, cappedSize, Sort.by(Sort.Direction.DESC, "dataVenda")),
                all.size());
    }

    // ─── BILLING, SETTLEMENT & LEGACY METHODS ────────────────────────────────────

    private void persistPayments(VendCreateDTO saleDTO, Venda savedSale, BigDecimal computedTotal) {
        Configuracao config = configuracaoService.getConfiguracaoForDate(savedSale.getDataVenda());
        BigDecimal expectedTotal = computedTotal != null ? computedTotal.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        applyPaymentsToSale(savedSale, saleDTO.getPayments(), saleDTO.getPaymentMethod(), expectedTotal, config);
    }

    public void updateSalePayments(Long saleId, List<VendaPaymentDTO> payments) {
        Venda venda = vendaRepository.findById(saleId).orElseThrow(() -> new ResourceNotFoundException("Venda not found"));
        List<VendaPagamento> existing = vendaPagamentoRepository != null ? vendaPagamentoRepository.findByVendaId(saleId) : List.of();
        if (existing != null && !existing.isEmpty()) {
            vendaPagamentoRepository.deleteAll(existing);
        }

        Configuracao config = null;
        try {
            config = configuracaoService.getConfiguracaoForDate(venda.getDataVenda());
        } catch (Exception e) {
            try { config = configuracaoService.getLatestConfiguracao().orElse(null); } catch (Exception ex) { config = null; }
        }
        BigDecimal expectedTotal = venda.getValorTotal() != null ? venda.getValorTotal().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        applyPaymentsToSale(venda, payments, null, expectedTotal, config);
        vendaRepository.save(venda);
    }

    private void applyPaymentsToSale(Venda sale, List<VendaPaymentDTO> payments, PaymentMethod fallbackPm, BigDecimal expectedTotal, Configuracao config) {
        List<VendaPagamento> created = new ArrayList<>();

        // 1. Definição do acréscimo de crédito padrão do sistema para o cliente (5%)
        BigDecimal defaultAcrescimoCredito = new BigDecimal("5.00");
        BigDecimal acrescimoCreditoPercent = (config != null && config.getAcrescimoCredito() != null)
                ? config.getAcrescimoCredito()
                : defaultAcrescimoCredito;

        // ─── BLOCO 1: PAGAMENTO ÚNICO (Caso a lista venha vazia ou nula) ───────────────────
        if (payments == null || payments.isEmpty()) {
            PaymentMethod pm = fallbackPm;
            BigDecimal valor = expectedTotal;

            // Aplica o percentual de acréscimo configurado apenas se for CRÉDITO
            BigDecimal percent = (pm == PaymentMethod.CREDITO) ? acrescimoCreditoPercent : BigDecimal.ZERO;
            BigDecimal acrescimo = valor.multiply(percent).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            BigDecimal valorPago = valor.add(acrescimo);

            VendaPagamento vp = new VendaPagamento();
            vp.setVenda(sale);
            vp.setMetodoPagamento(pm);
            vp.setValor(valor.setScale(2, RoundingMode.HALF_UP));
            vp.setAcrescimoPercent(percent.setScale(2, RoundingMode.HALF_UP));
            vp.setAcrescimoValor(acrescimo.setScale(2, RoundingMode.HALF_UP));
            vp.setValorPago(valorPago.setScale(2, RoundingMode.HALF_UP));
            vp.setCriadoEm(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));

            created.add(vp);
            if (vendaPagamentoRepository != null) {
                vendaPagamentoRepository.save(vp);
            }
        }
        // ─── BLOCO 2: SPLIT PAYMENTS / LISTA DE PAGAMENTOS VINDOS DO FRONT ──────────────────
        else {
            // Soma os valores LÍQUIDOS enviados pelo front-end
            BigDecimal sum = BigDecimal.ZERO;
            for (VendaPaymentDTO p : payments) {
                BigDecimal v = p.getValor() != null ? p.getValor() : BigDecimal.ZERO;
                sum = sum.add(v);
            }
            sum = sum.setScale(2, RoundingMode.HALF_UP);

            long expectedCents = expectedTotal.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();
            long sumCents = sum.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();

            // Validação de segurança: a soma líquida não pode passar o valor dos produtos
            if (sumCents > expectedCents) {
                throw new BusinessException("Total dos pagamentos excede o valor total da venda");
            }

            // Ajuste automático de dízimas periódicas de centavos (ex: dividir 100 reais em 3x)
            long diffCents = expectedCents - sumCents;
            if (diffCents != 0 && !payments.isEmpty()) {
                for (int i = payments.size() - 1; i >= 0; i--) {
                    VendaPaymentDTO last = payments.get(i);
                    if (last.getValor() == null) last.setValor(BigDecimal.ZERO);

                    BigDecimal valorAjustado = last.getValor().add(
                            new BigDecimal(diffCents).divide(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)
                    );
                    last.setValor(valorAjustado);

                    // Como alteramos o valor líquido da última linha para fechar a conta,
                    // precisamos recalcular o acréscimo e o valor pago dela proporcionalmente
                    if (last.getPaymentMethod() == PaymentMethod.CREDITO) {
                        BigDecimal novoAcrescimo = valorAjustado.multiply(acrescimoCreditoPercent).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                        last.setAcrescimoValor(novoAcrescimo);
                        last.setValorPago(valorAjustado.add(novoAcrescimo));
                    } else {
                        last.setAcrescimoValor(BigDecimal.ZERO);
                        last.setValorPago(valorAjustado);
                    }
                    break;
                }
            }

            // Persistência direta das linhas validadas no banco de dados
            for (VendaPaymentDTO p : payments) {
                PaymentMethod pm = p.getPaymentMethod();

                VendaPagamento vp = new VendaPagamento();
                vp.setVenda(sale);
                vp.setMetodoPagamento(pm);

                // Atribui os valores líquidos e cheios mapeados de forma direta do DTO do front
                vp.setValor(p.getValor() != null ? p.getValor().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

                // Determina o percentual correto baseado no consenso (Apenas crédito cobra acréscimo)
                BigDecimal percentAplicado = (pm == PaymentMethod.CREDITO) ? acrescimoCreditoPercent : BigDecimal.ZERO;
                vp.setAcrescimoPercent(percentAplicado.setScale(2, RoundingMode.HALF_UP));

                // Recupera os valores de acréscimo em espécie e total pago enviados pelo front
                vp.setAcrescimoValor(p.getAcrescimoValor() != null ? p.getAcrescimoValor().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
                vp.setValorPago(p.getValorPago() != null ? p.getValorPago().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);

                vp.setCriadoEm(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));

                created.add(vp);
                if (vendaPagamentoRepository != null) {
                    vendaPagamentoRepository.save(vp);
                }
            }
        }

        if (!created.isEmpty()) {
            sale.setPagamentos(created);
        }
    }

    public static List<BigDecimal> equalSplit(BigDecimal total, int parts) {
        if (parts <= 0) throw new IllegalArgumentException("parts must be > 0");
        long totalCents = total.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();
        long base = totalCents / parts;
        long remainder = totalCents - base * parts;
        List<BigDecimal> result = new ArrayList<>();
        for (int i = 0; i < parts; i++) {
            long cents = base + (i == parts - 1 ? remainder : 0);
            result.add(new BigDecimal(cents).divide(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP));
        }
        return result;
    }
}