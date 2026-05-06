package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ProdutoCreateDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.models.Marca;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.repositories.CategoriaRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.MarcaRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceProductCrudTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MarcaRepository marcaRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @InjectMocks
    private CatalogoService catalogService;

    @Test
    void updateProduto_ShouldReturnUpdated_WhenValid() {
        Categoria categoria = new Categoria(1L, "C", null);
        Marca marca = new Marca(1L, "M", null);
        Produto existing = new Produto(1L, "Old", UnitMeasurement.KG, "000001", false, new BigDecimal("10.00"), categoria, marca, new ArrayList<>());

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProdutoCreateDTO dto = new ProdutoCreateDTO("New", UnitMeasurement.KG, "000002", false, new BigDecimal("12.00"), 1L, 1L);

        var result = catalogService.updateProduct(1L, dto);

        assertNotNull(result);
        assertEquals("New", result.getNome());
        assertEquals("000002", result.getCodigo());
        verify(produtoRepository).save(any(Produto.class));
    }

    @Test
    void deleteProduto_ShouldDelete_WhenNotLinked() {
        Produto existing = new Produto(1L, "ToDelete", UnitMeasurement.KG, "000003", false, new BigDecimal("10.00"), new Categoria(1L, "C", null), new Marca(1L, "M", null), new ArrayList<>());
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(movimentacaoRepository.existsByProdutoId(1L)).thenReturn(false);

        catalogService.deleteProduct(1L);

        verify(produtoRepository).delete(existing);
    }

    @Test
    void deleteProduto_ShouldThrow_WhenLinked() {
        Produto existing = new Produto(1L, "ToDelete", UnitMeasurement.KG, "000003", false, new BigDecimal("10.00"), new Categoria(1L, "C", null), new Marca(1L, "M", null), new ArrayList<>());
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(movimentacaoRepository.existsByProdutoId(1L)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> catalogService.deleteProduct(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("vincul"));
    }
}
