package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.UnitMeasurement;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DTOsConditionTest {

    @Test
    void compraEmEstoqueDTO_equalsHashCodeToString() {
        CompraEmEstoqueDTO a = new CompraEmEstoqueDTO();
        a.setPurchase_id(1L);
        a.setPurchase_date(LocalDate.of(2021, 5, 1));
        a.setExpiring_date(LocalDate.of(2022, 5, 1));
        a.setQuantity(new BigDecimal("2.00"));
        a.setUnitSalePrice(new BigDecimal("3.50"));

        CompraEmEstoqueDTO b = new CompraEmEstoqueDTO();
        b.setPurchase_id(1L);
        b.setPurchase_date(LocalDate.of(2021, 5, 1));
        b.setExpiring_date(LocalDate.of(2022, 5, 1));
        b.setQuantity(new BigDecimal("2.00"));
        b.setUnitSalePrice(new BigDecimal("3.50"));

        assertTrue(a.equals(a));
        assertTrue(a.equals(b));
        assertTrue(b.equals(a));
        assertEquals(a.hashCode(), b.hashCode());
        assertFalse(a.equals(null));
        assertFalse(a.equals(new Object()));

        b.setUnitSalePrice(new BigDecimal("4.00"));
        assertFalse(a.equals(b));
        assertNotEquals(a.hashCode(), b.hashCode());
        assertNotNull(a.toString());
    }

    @Test
    void compraItemDiscardDTO_constructorsEquals() {
        CompraItemDiscardDTO x = new CompraItemDiscardDTO(new BigDecimal("5"), "TYPE");
        CompraItemDiscardDTO y = new CompraItemDiscardDTO(new BigDecimal("5"), "TYPE");

        assertEquals(0, x.getQuantity().compareTo(y.getQuantity()));
        assertTrue(x.equals(y));
        assertEquals(x.hashCode(), y.hashCode());

        CompraItemDiscardDTO z = new CompraItemDiscardDTO();
        z.setQuantity(new BigDecimal("1"));
        z.setType("OTHER");
        assertFalse(x.equals(z));
    }

    @Test
    void produtoResponse_and_vendItemReport_equals() {
        ProdutoResponseDTO p1 = new ProdutoResponseDTO();
        p1.setId(10L);
        p1.setName("P");
        p1.setCode("C10");
        p1.setBrandName("B");
        p1.setUnitMeasurement("UN");
        p1.setCategoryName("Cat");

        ProdutoResponseDTO p2 = new ProdutoResponseDTO();
        p2.setId(10L);
        p2.setName("P");
        p2.setCode("C10");
        p2.setBrandName("B");
        p2.setUnitMeasurement("UN");
        p2.setCategoryName("Cat");

        assertTrue(p1.equals(p2));
        assertEquals(p1.hashCode(), p2.hashCode());

        VendItemReportDTO v1 = new VendItemReportDTO();
        v1.setProductName("X");
        v1.setMarca("M");
        v1.setCategoria("C");
        v1.setQuantity(new BigDecimal("2"));
        v1.setPurchasePrice(new BigDecimal("3"));
        v1.setSalePrice(new BigDecimal("5"));
        v1.setTotal(new BigDecimal("10"));

        VendItemReportDTO v2 = new VendItemReportDTO();
        v2.setProductName("X");
        v2.setMarca("M");
        v2.setCategoria("C");
        v2.setQuantity(new BigDecimal("2"));
        v2.setPurchasePrice(new BigDecimal("3"));
        v2.setSalePrice(new BigDecimal("5"));
        v2.setTotal(new BigDecimal("10"));

        assertTrue(v1.equals(v2));
        assertEquals(v1.hashCode(), v2.hashCode());
        v2.setTotal(new BigDecimal("11"));
        assertFalse(v1.equals(v2));
    }

    @Test
    void vendaResponse_and_produtoComCompraDTO_nestedEquals() {
        VendaResponseDTO vr1 = new VendaResponseDTO();
        vr1.setId(2L);
        vr1.setDataVenda(LocalDate.of(2022,1,1));
        vr1.setUsuarioId(3L);
        vr1.setUsuarioNome("U");
        vr1.setClienteId(4L);
        vr1.setClienteNickname("C");
        vr1.setPaymentMethod("CARD");
        vr1.setHasDiscount(Boolean.TRUE);
        vr1.setTotalValue(new BigDecimal("1000"));
        vr1.setItems(List.of());

        VendaResponseDTO vr2 = new VendaResponseDTO();
        vr2.setId(2L);
        vr2.setDataVenda(LocalDate.of(2022,1,1));
        vr2.setUsuarioId(3L);
        vr2.setUsuarioNome("U");
        vr2.setClienteId(4L);
        vr2.setClienteNickname("C");
        vr2.setPaymentMethod("CARD");
        vr2.setHasDiscount(Boolean.TRUE);
        vr2.setTotalValue(new BigDecimal("1000"));
        vr2.setItems(List.of());

        assertTrue(vr1.equals(vr2));
        assertEquals(vr1.hashCode(), vr2.hashCode());

        ProdutoComCompraEmEstoqueDTO pc1 = new ProdutoComCompraEmEstoqueDTO();
        pc1.setId(9);
        pc1.setCode("P9");
        pc1.setProduct_name("Name");
        pc1.setBrand_name("B");
        pc1.setUnitMeasurement(UnitMeasurement.KG);
        CompraEmEstoqueDTO ce = new CompraEmEstoqueDTO();
        ce.setPurchase_id(5L);
        pc1.setPurchases(List.of(ce));

        ProdutoComCompraEmEstoqueDTO pc2 = new ProdutoComCompraEmEstoqueDTO();
        pc2.setId(9);
        pc2.setCode("P9");
        pc2.setProduct_name("Name");
        pc2.setBrand_name("B");
        pc2.setUnitMeasurement(UnitMeasurement.KG);
        CompraEmEstoqueDTO ce2 = new CompraEmEstoqueDTO();
        ce2.setPurchase_id(5L);
        pc2.setPurchases(List.of(ce2));

        assertTrue(pc1.equals(pc2));
        assertEquals(pc1.hashCode(), pc2.hashCode());

        pc2.setCode("DIFFERENT");
        assertFalse(pc1.equals(pc2));
    }

    @Test
    void compraItemResponse_cliente_login_message_equals() {
        CompraItemResponseDTO cr1 = new CompraItemResponseDTO(100L, new BigDecimal("1.5"), new BigDecimal("3.5"), LocalDate.of(2024,5,1));
        CompraItemResponseDTO cr2 = new CompraItemResponseDTO(100L, new BigDecimal("1.5"), new BigDecimal("3.5"), LocalDate.of(2024,5,1));
        assertTrue(cr1.equals(cr2));
        assertEquals(cr1.hashCode(), cr2.hashCode());

        ClienteResponseDTO cl1 = new ClienteResponseDTO();
        cl1.setId(55L);
        cl1.setNickname("nick");
        cl1.setTelefone("t");
        cl1.setDocumento("d");
        cl1.setEmail("e");
        cl1.setDataCadastro(LocalDateTime.of(2023,2,3,4,5));

        ClienteResponseDTO cl2 = new ClienteResponseDTO();
        cl2.setId(55L);
        cl2.setNickname("nick");
        cl2.setTelefone("t");
        cl2.setDocumento("d");
        cl2.setEmail("e");
        cl2.setDataCadastro(LocalDateTime.of(2023,2,3,4,5));

        assertTrue(cl1.equals(cl2));
        assertEquals(cl1.hashCode(), cl2.hashCode());

        LoginDTO login = new LoginDTO();
        login.setIdentifier("id");
        login.setPassword("pw");
        assertEquals("id", login.getIdentifier());

        MessageResponseDTO msg = new MessageResponseDTO("ok");
        assertEquals("ok", msg.getMessage());
    }
}
