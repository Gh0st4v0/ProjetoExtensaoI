package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.UnitMeasurement;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProdutoComCompraEmEstoqueDTOTest {

    @Test
    void lombokMethods() {
        ProdutoComCompraEmEstoqueDTO dto = new ProdutoComCompraEmEstoqueDTO();
        dto.setId(5);
        dto.setCode("CODE");
        dto.setProduct_name("Prod");
        dto.setBrand_name("Brand");
        dto.setUnitMeasurement(UnitMeasurement.UN);

        CompraEmEstoqueDTO c = new CompraEmEstoqueDTO();
        c.setPurchase_id(1L);
        c.setPurchase_date(LocalDate.of(2024,1,1));
        c.setQuantity(new BigDecimal("10"));

        dto.setPurchases(List.of(c));

        assertEquals(Integer.valueOf(5), dto.getId());
        assertEquals("Prod", dto.getProduct_name());
        assertEquals(UnitMeasurement.UN, dto.getUnitMeasurement());
        assertEquals(1, dto.getPurchases().size());
    }
}
