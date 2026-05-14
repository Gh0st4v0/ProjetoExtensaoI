package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class VendaItemResponseDTOTest {

    @Test
    void lombokMethods() {
        VendaItemResponseDTO dto = new VendaItemResponseDTO();
        dto.setProductId(10L);
        dto.setProductName("Name");
        dto.setQuantity(new BigDecimal("2"));
        dto.setPrecoUnitarioVenda(new BigDecimal("5"));
        dto.setPrecoUnitarioCompra(new BigDecimal("3"));

        assertEquals(Long.valueOf(10L), dto.getProductId());
        assertEquals("Name", dto.getProductName());
        assertEquals(new BigDecimal("2"), dto.getQuantity());
    }
}
