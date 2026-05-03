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

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final CompraRepository compraRepository;
    private final com.example.SpringBootApp.repositories.ClienteRepository clienteRepository;
    
    public Venda createSale(VendCreateDTO saleDTO) {
        Usuario usuario = usuarioRepository.findById(saleDTO.getUserId()).orElseThrow(() -> new ResourceNotFoundException("Usuario not found"));

        Venda venda = new Venda();
        venda.setDataVenda(saleDTO.getSaleDate());
        // valorTotal will be computed server-side
        venda.setMetodoPagamento(saleDTO.getPaymentMethod());
        venda.setTemDesconto(saleDTO.getHasDiscount());
        venda.setUsuario(usuario);

        // save early to obtain an id for movimentacoes; valorTotal will be updated after items processed
        Venda savedSale = vendaRepository.save(venda);

        List<Movimentacao> items = new ArrayList<>();
        BigDecimal computedTotal = BigDecimal.ZERO;

        // link client if provided
        if (saleDTO.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(saleDTO.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with id: " + saleDTO.getClienteId()));
            savedSale.setCliente(cliente);
        }

        for (VendItemDTO itemDTO : saleDTO.getItems()) {
            Produto produto = produtoRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto not found with id: " + itemDTO.getProductId()));

            BigDecimal requiredQty = itemDTO.getQuantity() != null ? itemDTO.getQuantity() : BigDecimal.ZERO;

            // validação: se o produto for UN, quantidade deve ser inteira (ex.: 2.0000)
            if (produto.getUnidadeMedida() == UnitMeasurement.UN) {
                if (requiredQty == null || requiredQty.stripTrailingZeros().scale() > 0) {
                    throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + produto.getId());
                }
            }

            // verify aggregated stock for product
            BigDecimal totalAvailable = movimentacaoRepository.sumQuantityByProdutoId(produto.getId());
            if (totalAvailable == null) totalAvailable = BigDecimal.ZERO;
            if (totalAvailable.compareTo(requiredQty) < 0) {
                throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
            }

            if (itemDTO.getPurchaseId() != null) {
                Compra compra = compraRepository.findById(itemDTO.getPurchaseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Compra not found with id: " + itemDTO.getPurchaseId()));

                Movimentacao stockItem = movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(compra.getId(), produto.getId());
                
                if (stockItem == null) {
                    throw new ResourceNotFoundException("Lote de estoque não encontrado para a compra ID: " + compra.getId());
                }

                Movimentacao movimentacao = new Movimentacao();
                movimentacao.setProduto(produto);
                movimentacao.setCompra(compra);
                movimentacao.setVenda(savedSale);
                movimentacao.setQuantidade(requiredQty.multiply(BigDecimal.valueOf(-1)));
                movimentacao.setTipoMovimentacao(MovementType.VENDA);

                BigDecimal salePrice = itemDTO.getPrecoUnitarioVenda() != null ? itemDTO.getPrecoUnitarioVenda() : ((stockItem != null && stockItem.getPrecoUnitarioVenda() != null) ? stockItem.getPrecoUnitarioVenda() : (produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO));
                movimentacao.setPrecoUnitarioVenda(salePrice);
                movimentacao.setPrecoUnitarioCompra(stockItem.getPrecoUnitarioCompra());

                items.add(movimentacaoRepository.save(movimentacao));

                // accumulate total
                computedTotal = computedTotal.add(salePrice.multiply(requiredQty));
            } else {
                // auto-allocate across purchases (FIFO by compra.dataCompra)
                List<Compra> allCompras = new ArrayList<>(compraRepository.findAll());
                allCompras.sort((a, b) -> {
                    if (a.getDataCompra() == null && b.getDataCompra() == null) return 0;
                    if (a.getDataCompra() == null) return 1;
                    if (b.getDataCompra() == null) return -1;
                    return a.getDataCompra().compareTo(b.getDataCompra());
                });

                BigDecimal remaining = requiredQty;
                for (Compra compra : allCompras) {
                    if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
                    BigDecimal available = movimentacaoRepository.sumQuantityByPurchaseId(compra.getId());
                    if (available == null) available = BigDecimal.ZERO;
                    if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

                    // check if this compra contains the produto
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

                    BigDecimal salePrice = itemDTO.getPrecoUnitarioVenda() != null ? itemDTO.getPrecoUnitarioVenda() : ((stockItem != null && stockItem.getPrecoUnitarioVenda() != null) ? stockItem.getPrecoUnitarioVenda() : (produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO));
                    movimentacao.setPrecoUnitarioVenda(salePrice);
                    movimentacao.setPrecoUnitarioCompra(stockItem.getPrecoUnitarioCompra());

                    items.add(movimentacaoRepository.save(movimentacao));

                    // accumulate total with allocated quantity
                    computedTotal = computedTotal.add(salePrice.multiply(allocate));

                    remaining = remaining.subtract(allocate);
                }

                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    throw new BusinessException("Quantidade insuficiente em estoque para o produto id: " + produto.getId());
                }
            }
        }

        // apply discount if requested (5%)
        if (saleDTO.getHasDiscount() != null && saleDTO.getHasDiscount()) {
            computedTotal = computedTotal.multiply(new BigDecimal("0.95"));
        }

        // persist final total and items (managed entity - update happens on transaction commit)
        savedSale.setValorTotal(computedTotal);
        savedSale.setItens(items);
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
}


