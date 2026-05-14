package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProdutoResponseDTOTest {

    @Test
    void lombokMethods() {
        ProdutoResponseDTO dto = new ProdutoResponseDTO();
        dto.setId(7L);
        dto.setName("P");
        dto.setCode("C");
        dto.setBrandName("B");
        dto.setUnitMeasurement("UN");
        dto.setCategoryName("Cat");

        assertEquals(Long.valueOf(7L), dto.getId());
        assertEquals("P", dto.getName());
        assertEquals("C", dto.getCode());
        assertEquals("B", dto.getBrandName());
        assertEquals("UN", dto.getUnitMeasurement());
        assertEquals("Cat", dto.getCategoryName());
    }
}
