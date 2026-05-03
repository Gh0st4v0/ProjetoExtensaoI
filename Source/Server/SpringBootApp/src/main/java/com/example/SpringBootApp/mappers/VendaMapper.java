package com.example.SpringBootApp.mappers;

import com.example.SpringBootApp.DTOs.VendaItemResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Venda;

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
        dto.setPaymentMethod(venda.getMetodoPagamento() != null ? venda.getMetodoPagamento().name() : null);
        dto.setHasDiscount(venda.getTemDesconto());
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
