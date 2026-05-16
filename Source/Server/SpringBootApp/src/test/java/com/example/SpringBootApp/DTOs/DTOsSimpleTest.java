package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.UnitMeasurement;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DTOsSimpleTest {

    @Test
    void compraEmEstoqueDTO_gettersSetters() {
        CompraEmEstoqueDTO dto = new CompraEmEstoqueDTO();
        dto.setPurchase_id(123L);
        dto.setPurchase_date(LocalDate.of(2021,1,2));
        dto.setExpiring_date(LocalDate.of(2022,1,1));
        dto.setQuantity(new BigDecimal("10.50"));
        dto.setUnitSalePrice(new BigDecimal("5.25"));

        assertEquals(123L, dto.getPurchase_id().longValue());
        assertEquals(LocalDate.of(2021,1,2), dto.getPurchase_date());
        assertEquals(LocalDate.of(2022,1,1), dto.getExpiring_date());
        assertEquals(0, new BigDecimal("10.50").compareTo(dto.getQuantity()));
        assertEquals(0, new BigDecimal("5.25").compareTo(dto.getUnitSalePrice()));
    }

    @Test
    void compraItemDiscardDTO_allArgs_and_setters() {
        CompraItemDiscardDTO dto = new CompraItemDiscardDTO(new BigDecimal("2"), "TEST");
        assertEquals(0, new BigDecimal("2").compareTo(dto.getQuantity()));
        assertEquals("TEST", dto.getType());
        dto.setType("OTHER");
        assertEquals("OTHER", dto.getType());
    }

    @Test
    void produtoResponseDTO_fields() {
        ProdutoResponseDTO dto = new ProdutoResponseDTO();
        dto.setId(5L);
        dto.setName("Prod");
        dto.setCode("P01");
        dto.setBrandName("Brand");
        dto.setUnitMeasurement("KG");
        dto.setCategoryName("Cat");
        assertEquals(5L, dto.getId().longValue());
        assertEquals("Prod", dto.getName());
        assertEquals("P01", dto.getCode());
        assertEquals("Brand", dto.getBrandName());
        assertEquals("KG", dto.getUnitMeasurement());
        assertEquals("Cat", dto.getCategoryName());
    }

    @Test
    void vendItemReportDTO_and_vendaResponseDTO() {
        VendItemReportDTO v = new VendItemReportDTO();
        v.setProductName("x");
        v.setMarca("m");
        v.setCategoria("c");
        v.setQuantity(new BigDecimal("3"));
        v.setPurchasePrice(new BigDecimal("2"));
        v.setSalePrice(new BigDecimal("4"));
        v.setTotal(new BigDecimal("12"));
        assertEquals("x", v.getProductName());
        assertEquals("m", v.getMarca());
        assertEquals("c", v.getCategoria());
        assertEquals(0, new BigDecimal("12").compareTo(v.getTotal()));

        VendaResponseDTO vr = new VendaResponseDTO();
        vr.setId(77L);
        vr.setDataVenda(LocalDate.of(2023,1,1));
        vr.setUsuarioId(1L);
        vr.setUsuarioNome("u");
        vr.setClienteId(2L);
        vr.setClienteNickname("cli");
        vr.setPaymentMethod("CASH");
        vr.setHasDiscount(Boolean.FALSE);
        vr.setTotalValue(new BigDecimal("100"));
        vr.setItems(List.of());
        assertEquals(77L, vr.getId().longValue());
        assertEquals("u", vr.getUsuarioNome());
        assertEquals(0, new BigDecimal("100").compareTo(vr.getTotalValue()));
    }

    @Test
    void produtoComCompraEmEstoqueDTO_and_compraItemResponseDTO() {
        ProdutoComCompraEmEstoqueDTO p = new ProdutoComCompraEmEstoqueDTO();
        p.setId(9);
        p.setCode("C9");
        p.setProduct_name("pname");
        p.setBrand_name("b");
        p.setUnitMeasurement(UnitMeasurement.KG);
        CompraEmEstoqueDTO c = new CompraEmEstoqueDTO();
        c.setPurchase_id(10L);
        p.setPurchases(List.of(c));
        assertEquals(9, p.getId());
        assertEquals(UnitMeasurement.KG, p.getUnitMeasurement());
        assertEquals(1, p.getPurchases().size());

        CompraItemResponseDTO cr = new CompraItemResponseDTO(100L, new BigDecimal("1.5"), new BigDecimal("3.5"), LocalDate.of(2024,5,1));
        assertEquals(100L, cr.getProductId().longValue());
        assertEquals(0, new BigDecimal("1.5").compareTo(cr.getQuantity()));
    }

    @Test
    void clienteAndLoginAndMessageDTO() {
        ClienteResponseDTO cl = new ClienteResponseDTO();
        cl.setId(55L);
        cl.setNickname("nick");
        cl.setTelefone("t");
        cl.setDocumento("d");
        cl.setEmail("e");
        cl.setDataCadastro(LocalDateTime.of(2023,2,3,4,5));
        assertEquals(55L, cl.getId().longValue());
        assertEquals("nick", cl.getNickname());

        LoginDTO login = new LoginDTO();
        login.setIdentifier("me");
        login.setPassword("pwd");
        assertEquals("me", login.getIdentifier());

        MessageResponseDTO msg = new MessageResponseDTO("ok");
        assertEquals("ok", msg.getMessage());
    }
}
