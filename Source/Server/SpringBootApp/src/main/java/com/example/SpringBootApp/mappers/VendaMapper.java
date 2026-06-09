package com.example.SpringBootApp.mappers;

import com.example.SpringBootApp.DTOs.VendaItemResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.models.VendaPagamento;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class VendaMapper {

    public static VendaResponseDTO toResponse(Venda venda) {
        if (venda == null) return null;
        VendaResponseDTO dto = new VendaResponseDTO();
        dto.setId(venda.getId());
        dto.setDataVenda(venda.getDataVenda());
        if (venda.getUsuario() != null) {
            dto.setUsuarioId(venda.getUsuario().getId());
            dto.setUsuarioNome(venda.getUsuario().getNome());
        }
        if (venda.getCliente() != null) {
            dto.setClienteId(venda.getCliente().getId());
            dto.setClienteNickname(venda.getCliente().getNickname());
        }

        // map payments
        List<VendaPagamento> pagamentos = venda.getPagamentos();
        if (pagamentos != null && !pagamentos.isEmpty()) {
            // set paymentMethod to first (legacy) or combined
            String pm = pagamentos.get(0).getMetodoPagamento() != null ? pagamentos.get(0).getMetodoPagamento().name() : null;
            dto.setPaymentMethod(pm);

            // aggregate payments by method to avoid duplicate labels (e.g., DEBITO DEBITO)
            java.util.LinkedHashMap<String, com.example.SpringBootApp.DTOs.VendaPagamentoDTO> agg = new java.util.LinkedHashMap<>();
            for (VendaPagamento p : pagamentos) {
                String methodName = p.getMetodoPagamento() != null ? p.getMetodoPagamento().name() : null;
                com.example.SpringBootApp.DTOs.VendaPagamentoDTO pd = agg.get(methodName);
                if (pd == null) {
                    pd = new com.example.SpringBootApp.DTOs.VendaPagamentoDTO();
                    pd.setPaymentMethod(methodName);
                    pd.setValor(p.getValor());
                    pd.setAcrescimoPercent(p.getAcrescimoPercent());
                    pd.setAcrescimoValor(p.getAcrescimoValor());
                    pd.setValorPago(p.getValorPago());
                    agg.put(methodName, pd);
                } else {
                    pd.setValor((pd.getValor() != null ? pd.getValor() : BigDecimal.ZERO).add(p.getValor() != null ? p.getValor() : BigDecimal.ZERO));
                    pd.setAcrescimoValor((pd.getAcrescimoValor() != null ? pd.getAcrescimoValor() : BigDecimal.ZERO).add(p.getAcrescimoValor() != null ? p.getAcrescimoValor() : BigDecimal.ZERO));
                    pd.setValorPago((pd.getValorPago() != null ? pd.getValorPago() : BigDecimal.ZERO).add(p.getValorPago() != null ? p.getValorPago() : BigDecimal.ZERO));
                    // keep parcelas and referencia from first occurrence
                }
            }

            List<com.example.SpringBootApp.DTOs.VendaPagamentoDTO> payDTOs = new java.util.ArrayList<>(agg.values());
            dto.setPayments(payDTOs);

            BigDecimal surcharge = pagamentos.stream()
                    .map(VendaPagamento::getAcrescimoValor)
                    .filter(v -> v != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setSurchargeTotal(surcharge);
        }

        dto.setHasDiscount(venda.getHasDesconto());
        dto.setTotalValue(venda.getValorTotal());

        List<Movimentacao> movs = venda.getItens();
        if (movs == null || movs.isEmpty()) {
            dto.setItems(Collections.emptyList());
            return dto;
        }

        List<VendaItemResponseDTO> items = movs.stream()
                .filter(m -> m.getQuantidade() != null && m.getQuantidade().compareTo(BigDecimal.ZERO) < 0)
                .map(m -> {
                    VendaItemResponseDTO item = new VendaItemResponseDTO();
                    item.setProductId(m.getProduto() != null ? m.getProduto().getId() : null);
                    item.setProductName(m.getProduto() != null ? m.getProduto().getNome() : null);
                    item.setBrandName(m.getProduto() != null && m.getProduto().getMarca() != null ? m.getProduto().getMarca().getNome() : null);
                    item.setQuantity(m.getQuantidade().abs());
                    item.setPrecoUnitarioVenda(m.getPrecoUnitarioVenda());
                    item.setPrecoUnitarioCompra(m.getPrecoUnitarioCompra());
                    return item;
                })
                .collect(Collectors.toList());

        dto.setItems(items);
        return dto;
    }
}
