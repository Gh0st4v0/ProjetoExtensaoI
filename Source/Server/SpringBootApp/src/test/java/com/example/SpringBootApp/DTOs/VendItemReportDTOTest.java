package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class VendItemReportDTOTest {

    @Test
    void lombokMethods() {
        VendItemReportDTO dto = new VendItemReportDTO();
        dto.setProductName("Prod");
        dto.setMarca("Brand");
        dto.setCategoria("Cat");
        dto.setQuantity(new BigDecimal("2"));
        dto.setPurchasePrice(new BigDecimal("1.5"));
        dto.setSalePrice(new BigDecimal("2.0"));
        dto.setTotal(new BigDecimal("4.0"));

        assertEquals("Prod", dto.getProductName());
        assertEquals("Brand", dto.getMarca());
        assertEquals("Cat", dto.getCategoria());
        assertEquals(new BigDecimal("2"), dto.getQuantity());
        assertEquals(new BigDecimal("1.5"), dto.getPurchasePrice());
        assertEquals(new BigDecimal("2.0"), dto.getSalePrice());
        assertEquals(new BigDecimal("4.0"), dto.getTotal());
    }
}
