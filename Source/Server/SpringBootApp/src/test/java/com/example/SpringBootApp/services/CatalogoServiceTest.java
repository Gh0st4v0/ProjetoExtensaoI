package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.MarcaCreateDTO;
import com.example.SpringBootApp.DTOs.CategoriaCreateDTO;
import com.example.SpringBootApp.DTOs.ProdutoCreateDTO;
import com.example.SpringBootApp.DTOs.ProdutoQuantidadeEstoqueDTO;
import com.example.SpringBootApp.exceptions.ResourceAlreadyExistsException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.Marca;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.repositories.MarcaRepository;
import com.example.SpringBootApp.repositories.CategoriaRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MarcaRepository marcaRepository;

    @InjectMocks
    private CatalogoService catalogService;

    @Test
    void createProduto_ShouldReturnProduto_WhenValidInput() {
        // Arrange
        ProdutoCreateDTO produtoDTO = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "000001", false, new java.math.BigDecimal("50.00"), 1L, 1L);
        Categoria categoria = new Categoria(1L, "Bovino", null);
        Marca marca = new Marca(1L, "Friboi", null);
        Produto expectedProduto = new Produto(1L, "Picanha", UnitMeasurement.KG, "000001", false, new BigDecimal("50.00"), categoria, marca, new ArrayList<>());

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(produtoRepository.existsByCodigo("000001")).thenReturn(false);
        when(produtoRepository.save(any(Produto.class))).thenReturn(expectedProduto);

        // Act
        Produto result = catalogService.createProducts(produtoDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Picanha", result.getNome());
        assertEquals(UnitMeasurement.KG, result.getUnidadeMedida());
        assertEquals("000001", result.getCodigo());
        assertEquals(categoria, result.getCategoria());
        assertEquals(marca, result.getMarca());

        verify(categoriaRepository).findById(1L);
        verify(marcaRepository).findById(1L);
        verify(produtoRepository).existsByCodigo("000001");
        verify(produtoRepository).save(any(Produto.class));
    }

    @Test
    void createProduto_ShouldThrowException_WhenCategoryNotFound() {
        // Arrange
        ProdutoCreateDTO produtoDTO = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "000001", false, new java.math.BigDecimal("50.00"), 999L, 1L);

        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> catalogService.createProducts(produtoDTO));

        assertEquals("Category not found", exception.getMessage());
        verify(categoriaRepository).findById(999L);
        verify(marcaRepository, never()).findById(any());
        verify(produtoRepository, never()).existsByCodigo(any());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void createProduto_ShouldThrowException_WhenBrandNotFound() {
        // Arrange
        ProdutoCreateDTO produtoDTO = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "000001", false, new java.math.BigDecimal("50.00"), 1L, 999L);
        Categoria categoria = new Categoria(1L, "Bovino", null);

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(marcaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> catalogService.createProducts(produtoDTO));

        assertEquals("Brand not found", exception.getMessage());
        verify(categoriaRepository).findById(1L);
        verify(marcaRepository).findById(999L);
        verify(produtoRepository, never()).existsByCodigo(any());
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void createProduto_ShouldThrowException_WhenCodeAlreadyExists() {
        // Arrange
        ProdutoCreateDTO produtoDTO = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "000001", false, new java.math.BigDecimal("50.00"), 1L, 1L);
        Categoria categoria = new Categoria(1L, "Bovino", null);
        Marca marca = new Marca(1L, "Friboi", null);

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(marca));
        when(produtoRepository.existsByCodigo("000001")).thenReturn(true);

        // Act & Assert
        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
                () -> catalogService.createProducts(produtoDTO));

        assertEquals("Product code already exists", exception.getMessage());
        verify(categoriaRepository).findById(1L);
        verify(marcaRepository).findById(1L);
        verify(produtoRepository).existsByCodigo("000001");
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void createCategoria_ShouldReturnCategoria_WhenValidInput() {
        // Arrange
        CategoriaCreateDTO categoriaDTO = new CategoriaCreateDTO("Suíno");
        Categoria expectedCategoria = new Categoria(1L, "Suíno", null);

        when(categoriaRepository.findAll()).thenReturn(new ArrayList<>());
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(expectedCategoria);

        // Act
        Categoria result = catalogService.createCategory(categoriaDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Suíno", result.getNome());

        verify(categoriaRepository).findAll();
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    void createCategoria_ShouldThrowException_WhenNameAlreadyExists() {
        // Arrange
        CategoriaCreateDTO categoriaDTO = new CategoriaCreateDTO("Bovino");

        when(categoriaRepository.findAll()).thenReturn(List.of(new Categoria(1L, "Bovino", null)));

        // Act & Assert
        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
                () -> catalogService.createCategory(categoriaDTO));

        assertEquals("Category name already exists", exception.getMessage());
        verify(categoriaRepository).findAll();
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void createMarca_ShouldReturnMarca_WhenValidInput() {
        // Arrange
        MarcaCreateDTO marcaDTO = new MarcaCreateDTO("Sadia");
        Marca expectedMarca = new Marca(1L, "Sadia", null);

        when(marcaRepository.findAll()).thenReturn(new ArrayList<>());
        when(marcaRepository.save(any(Marca.class))).thenReturn(expectedMarca);

        // Act
        Marca result = catalogService.createBrand(marcaDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Sadia", result.getNome());

        verify(marcaRepository).findAll();
        verify(marcaRepository).save(any(Marca.class));
    }

    @Test
    void createMarca_ShouldThrowException_WhenNameAlreadyExists() {
        // Arrange
        MarcaCreateDTO marcaDTO = new MarcaCreateDTO("Friboi");

        when(marcaRepository.findAll()).thenReturn(List.of(new Marca(1L, "Friboi", null)));

        // Act & Assert
        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
                () -> catalogService.createBrand(marcaDTO));

        assertEquals("Brand name already exists", exception.getMessage());
        verify(marcaRepository).findAll();
        verify(marcaRepository, never()).save(any());
    }

    @Test
    void searchProductsWithStock_ShouldReturnEmptyPage_WhenQueryHasLessThanTwoCharacters() {
        // Act
        Page<ProdutoQuantidadeEstoqueDTO> result = catalogService.searchProductsWithStock("a", 0);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(produtoRepository, never()).searchProductsWithStock(anyString(), any(Pageable.class));
    }

    @Test
    void searchProductsWithStock_ShouldUseTrimmedQueryAndPagination_WhenQueryIsValid() {
        // Arrange
        ProdutoQuantidadeEstoqueDTO dto = new ProdutoQuantidadeEstoqueDTO(
                1L,
                "Picanha",
                "001001",
                "Friboi",
                "",
                UnitMeasurement.KG,
                new BigDecimal("10.50"),
                new BigDecimal("0")
        );
        Page<ProdutoQuantidadeEstoqueDTO> expectedPage = new PageImpl<>(List.of(dto));

        when(produtoRepository.searchProductsWithStock(eq("pi"), any(Pageable.class))).thenReturn(expectedPage);

        // Act
        Page<ProdutoQuantidadeEstoqueDTO> result = catalogService.searchProductsWithStock("  pi  ", 1);

        // Assert
        assertEquals(expectedPage, result);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(produtoRepository).searchProductsWithStock(eq("pi"), pageableCaptor.capture());

        Pageable pageable = pageableCaptor.getValue();
        assertEquals(1, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
        assertEquals(Sort.by("nome").ascending(), pageable.getSort());
    }
}

