package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class CompraEmEstoqueDTOTest {

    @Test
    void lombokMethods() {
        CompraEmEstoqueDTO dto = new CompraEmEstoqueDTO();
        dto.setPurchase_id(123L);
        dto.setPurchase_date(LocalDate.of(2025,1,2));
        dto.setExpiring_date(LocalDate.of(2025,2,2));
        dto.setQuantity(new BigDecimal("10.5"));
        dto.setUnitSalePrice(new BigDecimal("5.25"));

        assertEquals(Long.valueOf(123L), dto.getPurchase_id());
        assertEquals(LocalDate.of(2025,1,2), dto.getPurchase_date());
        assertEquals(new BigDecimal("10.5"), dto.getQuantity());
        assertEquals(new BigDecimal("5.25"), dto.getUnitSalePrice());
    }
}
