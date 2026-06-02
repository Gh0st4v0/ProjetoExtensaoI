package com.example.SpringBootApp.services;

import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.DecarteRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventarioServiceExtraTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private DecarteRepository decarteRepository;

    @InjectMocks
    private InventarioService inventarioService;

    @Test
    void getProductsWithPurchaseInStock_groupsPurchases() {
        Movimentacao m = new Movimentacao();
        Compra compra = new Compra();
        compra.setId(55L);
        compra.setDataCompra(LocalDate.of(2024,1,1));
        m.setCompra(compra);
        m.setQuantidade(new BigDecimal("2.5"));
        m.setPrecoUnitarioVenda(new BigDecimal("10.00"));

        Produto p = new Produto();
        p.setId(100L);
        p.setNome("Prod100");
        p.setCodigo("C100");
        p.setUnidadeMedida(UnitMeasurement.KG);
        Marca marca = new Marca(); marca.setNome("BrandX"); p.setMarca(marca);
        p.setItens(List.of(m));

        when(produtoRepository.findAllWithItems()).thenReturn(List.of(p));

        var list = inventarioService.getProductsWithPurchaseInStock();
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(100, list.get(0).getId());
        assertNotNull(list.get(0).getPurchases());
        assertEquals(1, list.get(0).getPurchases().size());
    }

    @Test
    void getDiscards_mapsItemsCorrectly() {
        Descarte d = new Descarte();
        d.setId(200L);
        d.setDisposalDate(LocalDate.of(2024,2,2));
        Movimentacao m = new Movimentacao();
        Produto p = new Produto();
        p.setNome("foo");
        p.setUnidadeMedida(UnitMeasurement.KG);
        m.setProduto(p);
        m.setQuantidade(new BigDecimal("-3"));
        m.setTipoMovimentacao(MovementType.DESCARTE);
        d.setMovements(List.of(m));
        when(decarteRepository.findByDateRange(null, null)).thenReturn(List.of(d));

        var discs = inventarioService.getDiscards(null, null, PageRequest.of(0, 20));
        assertNotNull(discs);
        assertEquals(1, discs.getContent().size());
        var map = discs.getContent().get(0);
        assertEquals(200L, map.get("id"));
        assertEquals(1, ((List)map.get("items")).size());
    }
}
