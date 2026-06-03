package com.example.SpringBootApp.mappers;

import com.example.SpringBootApp.DTOs.VendaItemResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class VendaMapperAdditionalTest {

    @Test
    public void nullInput_returnsNull() {
        assertNull(VendaMapper.toResponse(null));
    }

    @Test
    public void emptyItems_returnEmptyList() {
        Venda v = new Venda();
        v.setId(1L);
        v.setItens(Collections.emptyList());
        VendaResponseDTO dto = VendaMapper.toResponse(v);
        assertNotNull(dto);
        assertEquals(Collections.emptyList(), dto.getItems());
    }

    @Test
    public void fullMapping_negativeQuantityMapped() {
        Venda v = new Venda();
        v.setId(1L);
        v.setDataVenda(java.time.LocalDate.of(2020,1,1).atStartOfDay());
        Usuario user = new Usuario();
        user.setId(2L);
        user.setNome("John");
        v.setUsuario(user);
        Cliente c = new Cliente();
        c.setId(3L);
        c.setNickname("cli");
        v.setCliente(c);
        com.example.SpringBootApp.models.VendaPagamento vp = new com.example.SpringBootApp.models.VendaPagamento();
        vp.setMetodoPagamento(PaymentMethod.CREDITO);
        vp.setVenda(v);
        v.setPagamentos(List.of(vp));
        v.setTemDesconto(Boolean.TRUE);
        v.setValorTotal(BigDecimal.valueOf(100));

        Produto p = new Produto();
        p.setId(10L);
        p.setNome("prod");

        Movimentacao m = new Movimentacao();
        m.setQuantidade(BigDecimal.valueOf(-2));
        m.setPrecoUnitarioVenda(BigDecimal.valueOf(15));
        m.setPrecoUnitarioCompra(BigDecimal.valueOf(10));
        m.setProduto(p);

        v.setItens(Arrays.asList(m));

        VendaResponseDTO dto = VendaMapper.toResponse(v);
        assertNotNull(dto);
        assertEquals(1, dto.getItems().size());
        VendaItemResponseDTO item = dto.getItems().get(0);
        assertEquals(p.getId(), item.getProductId());
        assertEquals(p.getNome(), item.getProductName());
        assertEquals(BigDecimal.valueOf(2), item.getQuantity());
    }
}
