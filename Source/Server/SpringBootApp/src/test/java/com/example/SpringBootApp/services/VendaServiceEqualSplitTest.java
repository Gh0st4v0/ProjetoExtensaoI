package com.example.SpringBootApp.services;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VendaServiceEqualSplitTest {

    @Test
    void equalSplit_distributes_cents_to_last() {
        List<BigDecimal> parts = VendaService.equalSplit(new BigDecimal("100.00"), 3);
        assertEquals(3, parts.size());
        assertEquals(new BigDecimal("33.33"), parts.get(0));
        assertEquals(new BigDecimal("33.33"), parts.get(1));
        assertEquals(new BigDecimal("33.34"), parts.get(2));
    }
}
