package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.MarcaCreateDTO;
import com.example.SpringBootApp.DTOs.CategoriaCreateDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.exceptions.ResourceAlreadyExistsException;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceCrudTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MarcaRepository marcaRepository;

    @InjectMocks
    private CatalogoService catalogService;

    @Test
    void createCategoria_ShouldThrowException_WhenNameDiffersOnlyByCaseOrAccents() {
        when(categoriaRepository.findAll()).thenReturn(List.of(new Categoria(1L, "Sádia", null)));

        CategoriaCreateDTO dto = new CategoriaCreateDTO("SADIA");

        ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class,
                () -> catalogService.createCategory(dto));

        assertEquals("Category name already exists", ex.getMessage());
    }

    @Test
    void createMarca_ShouldThrowException_WhenNameDiffersOnlyByCaseOrAccents() {
        when(marcaRepository.findAll()).thenReturn(List.of(new Marca(1L, "Sádia", null)));

        MarcaCreateDTO dto = new MarcaCreateDTO("Sadia");

        ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class,
                () -> catalogService.createBrand(dto));

        assertEquals("Brand name already exists", ex.getMessage());
    }

    @Test
    void updateCategoria_ShouldReturnUpdated_WhenValid() {
        Categoria existing = new Categoria(1L, "OldName", null);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.findAll()).thenReturn(List.of(existing));
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoriaCreateDTO dto = new CategoriaCreateDTO("NewName");

        var result = catalogService.updateCategory(1L, dto);

        assertNotNull(result);
        assertEquals("NewName", result.getNome());
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    void deleteCategoria_ShouldDelete_WhenNotLinked() {
        Categoria existing = new Categoria(1L, "ToDelete", null);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(produtoRepository.findAll()).thenReturn(new ArrayList<>());

        catalogService.deleteCategory(1L);

        verify(categoriaRepository).delete(existing);
    }

    @Test
    void deleteCategoria_ShouldThrow_WhenLinked() {
        Categoria existing = new Categoria(1L, "ToDelete", null);
        Marca marca = new Marca(1L, "M", null);
        Produto prod = new Produto(1L, "P", UnitMeasurement.KG, "000001", false, new BigDecimal("10.00"), existing, marca, new ArrayList<>());

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(produtoRepository.findAll()).thenReturn(List.of(prod));

        BusinessException ex = assertThrows(BusinessException.class, () -> catalogService.deleteCategory(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("vincul"));
    }

    @Test
    void updateMarca_ShouldReturnUpdated_WhenValid() {
        Marca existing = new Marca(1L, "OldBrand", null);
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(marcaRepository.findAll()).thenReturn(List.of(existing));
        when(marcaRepository.save(any(Marca.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MarcaCreateDTO dto = new MarcaCreateDTO("NewBrand");

        var result = catalogService.updateBrand(1L, dto);

        assertNotNull(result);
        assertEquals("NewBrand", result.getNome());
        verify(marcaRepository).save(any(Marca.class));
    }

    @Test
    void deleteMarca_ShouldDelete_WhenNotLinked() {
        Marca existing = new Marca(1L, "ToDelete", null);
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(produtoRepository.findAll()).thenReturn(new ArrayList<>());

        catalogService.deleteBrand(1L);

        verify(marcaRepository).delete(existing);
    }

    @Test
    void deleteMarca_ShouldThrow_WhenLinked() {
        Marca existing = new Marca(1L, "ToDelete", null);
        Categoria categoria = new Categoria(1L, "C", null);
        Produto prod = new Produto(1L, "P", UnitMeasurement.KG, "000001", false, new BigDecimal("10.00"), categoria, existing, new ArrayList<>());

        when(marcaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(produtoRepository.findAll()).thenReturn(List.of(prod));

        BusinessException ex = assertThrows(BusinessException.class, () -> catalogService.deleteBrand(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("vincul"));
    }
}
