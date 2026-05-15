package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VendReportDTOTest {

    @Test
    void lombokMethods() {
        VendItemReportDTO item = new VendItemReportDTO();
        item.setProductName("P");
        item.setMarca("M");
        item.setCategoria("C");
        item.setQuantity(new BigDecimal("2"));
        item.setPurchasePrice(new BigDecimal("1"));
        item.setSalePrice(new BigDecimal("2"));
        item.setTotal(new BigDecimal("4"));

        VendReportDTO dto = new VendReportDTO();
        dto.setId(11L);
        dto.setSaleDate(LocalDate.of(2024,6,1));
        dto.setPaymentMethod("CASH");
        dto.setSalesmanName("Seller");
        dto.setTotalCost(new BigDecimal("10"));
        dto.setTotalPrice(new BigDecimal("20"));
        dto.setHasDiscount(false);
        dto.setItems(List.of(item));

        assertEquals(Long.valueOf(11L), dto.getId());
        assertEquals(LocalDate.of(2024,6,1), dto.getSaleDate());
        assertEquals("Seller", dto.getSalesmanName());
        assertEquals(1, dto.getItems().size());
    }
}
