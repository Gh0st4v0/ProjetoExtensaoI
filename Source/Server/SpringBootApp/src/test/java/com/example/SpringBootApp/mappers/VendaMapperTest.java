package com.example.SpringBootApp.mappers;

import com.example.SpringBootApp.DTOs.VendaItemResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VendaMapperTest {

    @Test
    void toResponse_mapsVendaAndItems() {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setNome("User One");

        Cliente c = new Cliente();
        c.setId(2L);
        c.setNickname("ClienteX");

        Produto p = new Produto();
        p.setId(10L);
        p.setNome("Picanha Premium");

        Compra compra = new Compra();
        compra.setId(100L);

        Venda venda = new Venda();
        venda.setId(50L);
        venda.setDataVenda(LocalDate.of(2026, 5, 3));
        venda.setValorTotal(new BigDecimal("25.50"));
        venda.setMetodoPagamento(PaymentMethod.PIX);
        venda.setTemDesconto(false);
        venda.setUsuario(u);
        venda.setCliente(c);

        Movimentacao m = new Movimentacao();
        m.setId(200L);
        m.setProduto(p);
        m.setCompra(compra);
        m.setVenda(venda);
        m.setTipoMovimentacao(MovementType.VENDA);
        m.setQuantidade(new BigDecimal("-2.0000"));
        m.setPrecoUnitarioCompra(new BigDecimal("10.00"));
        m.setPrecoUnitarioVenda(new BigDecimal("12.75"));

        venda.setItens(List.of(m));

        VendaResponseDTO dto = VendaMapper.toResponse(venda);

        assertNotNull(dto);
        assertEquals(50L, dto.getId().longValue());
        assertEquals(venda.getDataVenda(), dto.getDataVenda());
        assertEquals(1L, dto.getUsuarioId().longValue());
        assertEquals("User One", dto.getUsuarioNome());
        assertEquals(2L, dto.getClienteId().longValue());
        assertEquals("ClienteX", dto.getClienteNickname());
        assertEquals("PIX", dto.getPaymentMethod());
        assertEquals(false, dto.getHasDiscount());
        assertEquals(new BigDecimal("25.50"), dto.getTotalValue());

        assertNotNull(dto.getItems());
        assertEquals(1, dto.getItems().size());
        VendaItemResponseDTO item = dto.getItems().get(0);
        assertEquals(10L, item.getProductId().longValue());
        assertEquals("Picanha Premium", item.getProductName());
        assertEquals(new BigDecimal("2.0000"), item.getQuantity());
        assertEquals(new BigDecimal("12.75"), item.getPrecoUnitarioVenda());
        assertEquals(new BigDecimal("10.00"), item.getPrecoUnitarioCompra());
    }
}
