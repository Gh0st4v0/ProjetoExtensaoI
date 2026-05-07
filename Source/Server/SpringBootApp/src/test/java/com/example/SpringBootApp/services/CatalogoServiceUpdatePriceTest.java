package com.example.SpringBootApp.services;

import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.CategoriaRepository;
import com.example.SpringBootApp.repositories.MarcaRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceUpdatePriceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MarcaRepository marcaRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @InjectMocks
    private com.example.SpringBootApp.services.CatalogoService catalogoService;

    @Test
    void updateProductPrice_updatesAndReturnsProduct() {
        Produto p = new Produto();
        p.setId(1L);
        p.setPrecoVenda(new BigDecimal("5.00"));

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(p));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(i -> i.getArgument(0));

        Produto updated = catalogoService.updateProductPrice(1L, new BigDecimal("10.00"));
        assertEquals(0, updated.getPrecoVenda().compareTo(new BigDecimal("10.00")));
    }

    @Test
    void updateProductPrice_throwsNotFound_whenMissing() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> catalogoService.updateProductPrice(99L, new BigDecimal("1.00")));
    }

    @Test
    void updateProductPrice_throwsBusiness_whenNegative() {
        Produto p = new Produto();
        p.setId(1L);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(p));
        assertThrows(BusinessException.class, () -> catalogoService.updateProductPrice(1L, new BigDecimal("-1.00")));
    }
}
