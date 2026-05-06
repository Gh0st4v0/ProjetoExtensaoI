package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CategoriaCreateDTO;
import com.example.SpringBootApp.DTOs.CategoriaDTO;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.exceptions.ResourceAlreadyExistsException;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.services.CatalogoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CategoriaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogService;

    @InjectMocks
    private CategoriaController categoriaController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoriaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createCategoria_ShouldReturn201_WhenValidInput() throws Exception {
        setup();

        // Arrange
        CategoriaCreateDTO request = new CategoriaCreateDTO("Nova Categoria");
        Categoria savedCategoria = new Categoria(1L, "Nova Categoria", null);

        when(catalogService.createCategory(any(CategoriaCreateDTO.class))).thenReturn(savedCategoria);

        // Act & Assert
        mockMvc.perform(post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", "/categories/1"));
    }

    @Test
    void createCategoria_ShouldReturn409_WhenNameAlreadyExists() throws Exception {
        setup();

        // Arrange
        CategoriaCreateDTO request = new CategoriaCreateDTO("Categoria Existente");

        when(catalogService.createCategory(any(CategoriaCreateDTO.class)))
                .thenThrow(new ResourceAlreadyExistsException("Category name already exists"));

        // Act & Assert
        mockMvc.perform(post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Category name already exists"));
    }

    @Test
    void createCategoria_ShouldReturn400_WhenNameIsBlank() throws Exception {
        setup();

        // Arrange
        String invalidJson = "{\"name\": \"\"}";

        // Act & Assert
        mockMvc.perform(post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCategoria_ShouldReturn400_WhenNameIsNull() throws Exception {
        setup();

        // Arrange
        String invalidJson = "{}";

        // Act & Assert
        mockMvc.perform(post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllCategories_ShouldReturn200_WithListOfCategories() throws Exception {
        setup();

        // Arrange
        CategoriaDTO categoria1 = new CategoriaDTO();
        categoria1.setId(1L);
        categoria1.setCategoryName("Bovino");

        CategoriaDTO categoria2 = new CategoriaDTO();
        categoria2.setId(2L);
        categoria2.setCategoryName("Suíno");

        List<CategoriaDTO> categories = List.of(categoria1, categoria2);

        when(catalogService.getAllCategories()).thenReturn(categories);

        // Act & Assert
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].categoryName").value("Bovino"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].categoryName").value("Suíno"));
    }

    @Test
    void getAllCategories_ShouldReturn200_WithEmptyList() throws Exception {
        setup();

        // Arrange
        when(catalogService.getAllCategories()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}

