package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendItemReportDTO;
import com.example.SpringBootApp.DTOs.VendReportDTO;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.VendaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    VendaRepository vendaRepository;

    @InjectMocks
    RelatorioService relatorioService;

    @Test
    void getSalesReport_returnsConvertedReport() {
        Movimentacao m = new Movimentacao();
        m.setQuantidade(new BigDecimal("-2"));
        m.setPrecoUnitarioCompra(new BigDecimal("5"));
        m.setPrecoUnitarioVenda(new BigDecimal("10"));

        Produto p = new Produto();
        p.setNome("Prod1");
        Marca marca = new Marca();
        marca.setNome("Brand1");
        Categoria cat = new Categoria();
        cat.setNome("Cat1");
        p.setMarca(marca);
        p.setCategoria(cat);

        m.setProduto(p);

        Venda v = new Venda();
        v.setId(1L);
        v.setDataVenda(LocalDate.of(2024,5,1));
        v.setMetodoPagamento(PaymentMethod.DINHEIRO);
        Usuario u = new Usuario();
        u.setNome("Seller");
        v.setUsuario(u);
        v.setTemDesconto(false);
        v.setItens(List.of(m));
        m.setVenda(v);

        when(vendaRepository.findByDatavendaBetweenWithMovements(any(), any())).thenReturn(List.of(v));

        List<VendReportDTO> reports = relatorioService.getSalesReport(LocalDate.now().minusDays(1), LocalDate.now());
        assertEquals(1, reports.size());
        VendReportDTO report = reports.get(0);
        assertEquals(v.getId(), report.getId());
        assertEquals(v.getDataVenda(), report.getSaleDate());
        assertEquals("DINHEIRO", report.getPaymentMethod());
        assertEquals("Seller", report.getSalesmanName());

        assertFalse(report.getItems().isEmpty());
        VendItemReportDTO item = report.getItems().get(0);
        assertEquals(new BigDecimal("10"), item.getSalePrice());
        assertEquals(new BigDecimal("5"), item.getPurchasePrice());
        assertEquals(new BigDecimal("20"), report.getTotalPrice());
        assertEquals(new BigDecimal("10"), report.getTotalCost());
    }
}
