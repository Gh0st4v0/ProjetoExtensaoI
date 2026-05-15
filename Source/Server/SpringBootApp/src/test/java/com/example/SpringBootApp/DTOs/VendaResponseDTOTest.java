package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VendaResponseDTOTest {

    @Test
    void lombokMethods() {
        VendaItemResponseDTO item = new VendaItemResponseDTO();
        item.setProductId(1L);
        item.setProductName("X");
        item.setQuantity(new BigDecimal("3"));
        item.setPrecoUnitarioVenda(new BigDecimal("4.0"));
        item.setPrecoUnitarioCompra(new BigDecimal("2.0"));

        VendaResponseDTO dto = new VendaResponseDTO();
        dto.setId(5L);
        dto.setDataVenda(LocalDate.of(2024,1,1));
        dto.setUsuarioId(2L);
        dto.setUsuarioNome("User");
        dto.setClienteId(3L);
        dto.setClienteNickname("Client");
        dto.setPaymentMethod("CASH");
        dto.setHasDiscount(true);
        dto.setTotalValue(new BigDecimal("12.0"));
        dto.setItems(List.of(item));

        assertEquals(Long.valueOf(5L), dto.getId());
        assertEquals(LocalDate.of(2024,1,1), dto.getDataVenda());
        assertEquals(Long.valueOf(2L), dto.getUsuarioId());
        assertEquals("User", dto.getUsuarioNome());
        assertTrue(dto.getHasDiscount());
        assertEquals(1, dto.getItems().size());
        assertEquals("X", dto.getItems().get(0).getProductName());
    }
}
