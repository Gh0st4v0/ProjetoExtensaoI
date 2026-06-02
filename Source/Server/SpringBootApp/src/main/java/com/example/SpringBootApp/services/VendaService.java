package com.example.SpringBootApp.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.CompraRepository;
import com.example.SpringBootApp.repositories.VendaRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import com.example.SpringBootApp.DTOs.DescarteCreateDTO;
import com.example.SpringBootApp.DTOs.DescarteItemDTO;
import com.example.SpringBootApp.models.DescarteType;
import java.util.HashSet;
import java.util.Set;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class VendaService {

    private final com.example.SpringBootApp.repositories.VendaPagamentoRepository vendaPagamentoRepository;

    private final VendaRepository vendaRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final CompraRepository compraRepository;
    private final com.example.SpringBootApp.repositories.ClienteRepository clienteRepository;
    private final com.example.SpringBootApp.services.InventarioService inventarioService;
    private final com.example.SpringBootApp.services.ConfiguracaoService configuracaoService;
    private static final java.math.BigDecimal AUTO_DISCARD_THRESHOLD_KG = new java.math.BigDecimal("0.1000");
    
    public Venda createSale(VendCreateDTO saleDTO) {
        Usuario usuario = usuarioRepository.findById(saleDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario not found"));

        Venda venda = new Venda();
        // Always use server time for the sale timestamp to avoid relying on client-provided date-only values
        venda.setDataVenda(java.time.LocalDateTime.now());
        venda.setTemDesconto(saleDTO.getHasDiscount());
        venda.setUsuario(usuario);
        

        Venda savedSale = vendaRepository.save(venda);

        List<Movimentacao> items = new ArrayList<>();
        java.util.Set<Long> purchasesDiscarded = new java.util.HashSet<>();
        BigDecimal computedTotal = BigDecimal.ZERO;

        if (saleDTO.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(saleDTO.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with id: " + saleDTO.getClienteId()));
            savedSale.setCliente(cliente);
        }

        for (VendItemDTO itemDTO : saleDTO.getItems()) {
            Produto produto = produtoRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto not found with id: " + itemDTO.getProductId()));

            BigDecimal requiredQty = itemDTO.getQuantity() != null ? itemDTO.getQuantity() : BigDecimal.ZERO;

            if (produto.getUnidadeMedida() == UnitMeasurement.UN) {
                if (requiredQty == null || requiredQty.stripTrailingZeros().scale() > 0) {
                    throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + produto.getId());
                }
            }

            BigDecimal totalAvailable = movimentacaoRepository.sumQuantityByProdutoId(produto.getId());
            if (totalAvailable == null) totalAvailable = BigDecimal.ZERO;
            if (totalAvailable.compareTo(requiredQty) < 0) {
                throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
            }

            List<Compra> allCompras = compraRepository.findComprasWithStockForProduct(produto.getId());

            BigDecimal remaining = requiredQty;
            for (Compra compra : allCompras) {
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal available = movimentacaoRepository.sumQuantityByPurchaseAndProduct(compra.getId(), produto.getId());
                if (available == null) available = BigDecimal.ZERO;
                if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

                List<Movimentacao> movs = movimentacaoRepository.findByCompraIdAndProdutoId(compra.getId(), produto.getId());
                if (movs == null || movs.isEmpty()) continue;
                Movimentacao stockItem = movs.get(0);

                BigDecimal allocate = available.min(remaining);

                Movimentacao movimentacao = new Movimentacao();
                movimentacao.setProduto(produto);
                movimentacao.setCompra(compra);
                movimentacao.setVenda(savedSale);
                movimentacao.setQuantidade(allocate.multiply(BigDecimal.valueOf(-1)));
                movimentacao.setTipoMovimentacao(MovementType.VENDA);

                BigDecimal salePrice = itemDTO.getPrecoUnitarioVenda() != null ? itemDTO.getPrecoUnitarioVenda()
                        : ((stockItem != null && stockItem.getPrecoUnitarioVenda() != null) ? stockItem.getPrecoUnitarioVenda()
                                : (produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO));
                movimentacao.setPrecoUnitarioVenda(salePrice);
                movimentacao.setPrecoUnitarioCompra(stockItem.getPrecoUnitarioCompra());

                items.add(movimentacaoRepository.save(movimentacao));

                if (produto.getUnidadeMedida() == UnitMeasurement.KG) {
                    BigDecimal leftover = movimentacaoRepository.sumQuantityByPurchaseId(compra.getId());
                    if (leftover == null) leftover = BigDecimal.ZERO;
                    if (leftover.compareTo(BigDecimal.ZERO) > 0 && leftover.compareTo(AUTO_DISCARD_THRESHOLD_KG) < 0
                            && !purchasesDiscarded.contains(compra.getId())) {
                        DescarteItemDTO discardItem = new DescarteItemDTO(compra.getId(), produto.getId(), leftover);
                        DescarteCreateDTO discardDTO = new DescarteCreateDTO(null, DescarteType.PERDA_PESO,
                                java.util.List.of(discardItem));
                        inventarioService.createDiscard(discardDTO);
                        purchasesDiscarded.add(compra.getId());
                    }
                }

                computedTotal = computedTotal.add(salePrice.multiply(allocate));
                remaining = remaining.subtract(allocate);
            }

            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
            }
        }

        if (saleDTO.getHasDiscount() != null && saleDTO.getHasDiscount()) {
            computedTotal = computedTotal.multiply(new BigDecimal("0.95"));
        }

        savedSale.setValorTotal(computedTotal);
        savedSale.setItens(items);

        // persist payments (supports split payments and credit surcharge)
        persistPayments(saleDTO, savedSale, computedTotal);

        return savedSale;
    }

    public org.springframework.data.domain.Page<com.example.SpringBootApp.DTOs.VendaResponseDTO> listSales(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("dataVenda").descending());
        org.springframework.data.domain.Page<Venda> vendas = vendaRepository.findAll(pageable);
        return vendas.map(com.example.SpringBootApp.mappers.VendaMapper::toResponse);
    }

    public com.example.SpringBootApp.DTOs.VendaResponseDTO getSaleById(Long id) {
        Venda venda = vendaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venda not found"));
        return com.example.SpringBootApp.mappers.VendaMapper.toResponse(venda);
    }

    public java.util.List<com.example.SpringBootApp.DTOs.VendaResponseDTO> getSalesByClientId(Long clienteId) {
        return vendaRepository.findByClienteIdOrderByDataVendaDesc(clienteId)
                .stream()
                .map(com.example.SpringBootApp.mappers.VendaMapper::toResponse)
                .toList();
    }

    public org.springframework.data.domain.Page<com.example.SpringBootApp.DTOs.VendaResponseDTO> getSalesByClientId(
            Long clienteId, int page, int size) {
        int cappedSize = Math.min(size, 200);
        java.util.List<com.example.SpringBootApp.DTOs.VendaResponseDTO> all =
            vendaRepository.findByClienteIdOrderByDataVendaDesc(clienteId)
                .stream()
                .map(com.example.SpringBootApp.mappers.VendaMapper::toResponse)
                .toList();
        int start = page * cappedSize;
        java.util.List<com.example.SpringBootApp.DTOs.VendaResponseDTO> content = start >= all.size()
            ? java.util.Collections.emptyList()
            : all.subList(start, Math.min(start + cappedSize, all.size()));
        return new org.springframework.data.domain.PageImpl<>(
            content,
            org.springframework.data.domain.PageRequest.of(page, cappedSize,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "dataVenda")),
            all.size());
    }

    private void persistPayments(com.example.SpringBootApp.DTOs.VendCreateDTO saleDTO, Venda savedSale, java.math.BigDecimal computedTotal) {
        com.example.SpringBootApp.models.Configuracao config = null;
        try {
            config = configuracaoService.getConfiguracaoForDate(savedSale.getDataVenda());
        } catch (Exception e) {
            // best-effort fallback
            try { config = configuracaoService.getLatestConfiguracao().orElse(null); } catch (Exception ex) { config = null; }
        }

        java.math.BigDecimal expectedTotal = computedTotal != null ? computedTotal.setScale(2, java.math.RoundingMode.HALF_UP) : java.math.BigDecimal.ZERO;
        applyPaymentsToSale(savedSale, saleDTO.getPayments(), saleDTO.getPaymentMethod(), expectedTotal, config);
    }

    public void updateSalePayments(Long saleId, java.util.List<com.example.SpringBootApp.DTOs.VendPaymentDTO> payments) {
        Venda venda = vendaRepository.findById(saleId).orElseThrow(() -> new ResourceNotFoundException("Venda not found"));
        java.util.List<VendaPagamento> existing = vendaPagamentoRepository != null ? vendaPagamentoRepository.findByVendaId(saleId) : java.util.List.of();
        if (existing != null && !existing.isEmpty()) {
            vendaPagamentoRepository.deleteAll(existing);
        }

        com.example.SpringBootApp.models.Configuracao config = null;
        try {
            config = configuracaoService.getConfiguracaoForDate(venda.getDataVenda());
        } catch (Exception e) {
            try { config = configuracaoService.getLatestConfiguracao().orElse(null); } catch (Exception ex) { config = null; }
        }
        java.math.BigDecimal expectedTotal = venda.getValorTotal() != null ? venda.getValorTotal().setScale(2, java.math.RoundingMode.HALF_UP) : java.math.BigDecimal.ZERO;
        applyPaymentsToSale(venda, payments, null, expectedTotal, config);
        vendaRepository.save(venda);
    }

    private void applyPaymentsToSale(Venda sale, java.util.List<com.example.SpringBootApp.DTOs.VendPaymentDTO> payments, com.example.SpringBootApp.models.PaymentMethod fallbackPm, java.math.BigDecimal expectedTotal, com.example.SpringBootApp.models.Configuracao config) {
        java.util.List<VendaPagamento> created = new java.util.ArrayList<>();

        java.math.BigDecimal defaultCredit = new java.math.BigDecimal("5.00");
        java.math.BigDecimal defaultDebit = java.math.BigDecimal.ZERO;
        java.math.BigDecimal taxaCredito = config != null && config.getTaxaCredito() != null ? config.getTaxaCredito() : defaultCredit;
        java.math.BigDecimal taxaDebito = config != null && config.getTaxaDebito() != null ? config.getTaxaDebito() : defaultDebit;

        if (payments == null || payments.isEmpty()) {
            com.example.SpringBootApp.models.PaymentMethod pm = fallbackPm;
            java.math.BigDecimal valor = expectedTotal;
            java.math.BigDecimal percent = (pm == com.example.SpringBootApp.models.PaymentMethod.CREDITO) ? taxaCredito : (pm == com.example.SpringBootApp.models.PaymentMethod.DEBITO ? taxaDebito : java.math.BigDecimal.ZERO);
            java.math.BigDecimal acrescimo = valor.multiply(percent).divide(new java.math.BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal valorPago = valor.add(acrescimo);

            VendaPagamento vp = new VendaPagamento();
            vp.setVenda(sale);
            vp.setMetodoPagamento(pm);
            vp.setValor(valor);
            vp.setAcrescimoPercent(percent);
            vp.setAcrescimoValor(acrescimo);
            vp.setValorPago(valorPago);
            created.add(vp);
            if (vendaPagamentoRepository != null) vendaPagamentoRepository.save(vp);
        } else {
            java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
            for (com.example.SpringBootApp.DTOs.VendPaymentDTO p : payments) {
                java.math.BigDecimal v = p.getValor() != null ? p.getValor() : java.math.BigDecimal.ZERO;
                sum = sum.add(v);
            }
            sum = sum.setScale(2, java.math.RoundingMode.HALF_UP);

            long expectedCents = expectedTotal.multiply(new java.math.BigDecimal("100")).setScale(0, java.math.RoundingMode.HALF_UP).longValue();
            long sumCents = sum.multiply(new java.math.BigDecimal("100")).setScale(0, java.math.RoundingMode.HALF_UP).longValue();

            if (sumCents > expectedCents) {
                throw new BusinessException("Total dos pagamentos excede o valor total da venda");
            }

            long diffCents = expectedCents - sumCents;
            if (diffCents != 0 && !payments.isEmpty()) {
                for (int i = payments.size() - 1; i >= 0; i--) {
                    com.example.SpringBootApp.DTOs.VendPaymentDTO last = payments.get(i);
                    if (last.getValor() == null) last.setValor(java.math.BigDecimal.ZERO);
                    last.setValor(last.getValor().add(new java.math.BigDecimal(diffCents).divide(new java.math.BigDecimal("100")).setScale(2, java.math.RoundingMode.HALF_UP)));
                    break;
                }
            }

            for (com.example.SpringBootApp.DTOs.VendPaymentDTO p : payments) {
                com.example.SpringBootApp.models.PaymentMethod pm = p.getPaymentMethod();
                java.math.BigDecimal valor = p.getValor() != null ? p.getValor().setScale(2, java.math.RoundingMode.HALF_UP) : java.math.BigDecimal.ZERO;
                java.math.BigDecimal percent = (pm == com.example.SpringBootApp.models.PaymentMethod.CREDITO) ? taxaCredito : (pm == com.example.SpringBootApp.models.PaymentMethod.DEBITO ? taxaDebito : java.math.BigDecimal.ZERO);
                java.math.BigDecimal acrescimo = valor.multiply(percent).divide(new java.math.BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
                java.math.BigDecimal valorPago = valor.add(acrescimo);

                VendaPagamento vp = new VendaPagamento();
                vp.setVenda(sale);
                vp.setMetodoPagamento(pm);
                vp.setValor(valor);
                vp.setAcrescimoPercent(percent);
                vp.setAcrescimoValor(acrescimo);
                vp.setValorPago(valorPago);
                created.add(vp);
                if (vendaPagamentoRepository != null) vendaPagamentoRepository.save(vp);
            }
        }

        if (!created.isEmpty()) sale.setPagamentos(created);
    }

    public static java.util.List<java.math.BigDecimal> equalSplit(java.math.BigDecimal total, int parts) {
        if (parts <= 0) throw new IllegalArgumentException("parts must be > 0");
        long totalCents = total.multiply(new java.math.BigDecimal("100")).setScale(0, java.math.RoundingMode.HALF_UP).longValue();
        long base = totalCents / parts;
        long remainder = totalCents - base * parts;
        java.util.List<java.math.BigDecimal> result = new java.util.ArrayList<>();
        for (int i = 0; i < parts; i++) {
            long cents = base + (i == parts - 1 ? remainder : 0);
            result.add(new java.math.BigDecimal(cents).divide(new java.math.BigDecimal("100")).setScale(2, java.math.RoundingMode.HALF_UP));
        }
        return result;
    }}



