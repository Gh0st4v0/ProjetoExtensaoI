package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class CompraItemDiscardDTOTest {

    @Test
    void lombokGeneratedMethods_WorkAsExpected() {
        CompraItemDiscardDTO dto = new CompraItemDiscardDTO();
        dto.setQuantity(new BigDecimal("2"));
        dto.setType("SOME_TYPE");

        assertEquals(new BigDecimal("2"), dto.getQuantity());
        assertEquals("SOME_TYPE", dto.getType());

        CompraItemDiscardDTO dto2 = new CompraItemDiscardDTO(dto.getQuantity(), dto.getType());
        assertEquals(dto, dto2);
    }
}
