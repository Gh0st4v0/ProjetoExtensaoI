package com.example.SpringBootApp.models;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

public class ProdutoTest {

    private Produto createProdutoFull() {
        Produto p = new Produto();
        p.setId(10L);
        p.setNome("P1");
        p.setUnidadeMedida(UnitMeasurement.KG);
        p.setCodigo("ABC123");
        p.setIsPerecivel(Boolean.TRUE);
        p.setPrecoVenda(new BigDecimal("10.00"));
        Categoria c = new Categoria();
        c.setId(1L);
        c.setNome("Cat");
        p.setCategoria(c);
        Marca m = new Marca();
        m.setId(2L);
        m.setNome("Marca");
        p.setMarca(m);
        p.setItens(new ArrayList<>());
        return p;
    }

    @Test
    public void equalsAndHashCode_sameValues() {
        Produto a = createProdutoFull();
        Produto b = createProdutoFull();
        // ensure nested objects are the same instance so Lombok-generated equals treats them as equal
        b.setCategoria(a.getCategoria());
        b.setMarca(a.getMarca());
        b.setItens(a.getItens());
        assertEquals(a, b);
        assertEquals(a.hashCode(), b.hashCode());
        assertTrue(a.toString().contains("P1"));
        assertFalse(a.equals(null));
        assertFalse(a.equals("x"));
    }

    @Test
    public void equals_differentFieldsCauseInequality() {
        Produto a = createProdutoFull();

        Produto b = createProdutoFull(); b.setId(11L); assertNotEquals(a,b); b.setId(a.getId());
        b = createProdutoFull(); b.setNome("Other"); assertNotEquals(a,b);
        b = createProdutoFull(); b.setCodigo(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setUnidadeMedida(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setIsPerecivel(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setPrecoVenda(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setCategoria(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setMarca(null); assertNotEquals(a,b);
        b = createProdutoFull(); b.setItens(null); assertNotEquals(a,b);
    }

    @Test
    public void equals_handlesNullAndEmptyListDifferences() {
        Produto a = createProdutoFull();
        Produto b = createProdutoFull();
        // make nested references identical to avoid false negatives due to separate Categoria/Marca instances
        b.setCategoria(a.getCategoria());
        b.setMarca(a.getMarca());
        b.setItens(new ArrayList<>());
        assertEquals(a, b);
        b.setItens(null);
        assertNotEquals(a, b);
    }
}
