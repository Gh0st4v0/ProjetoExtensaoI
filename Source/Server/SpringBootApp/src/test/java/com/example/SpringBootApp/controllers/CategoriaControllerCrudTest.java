package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CategoriaCreateDTO;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.exceptions.BusinessException;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoriaControllerCrudTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogService;

    @InjectMocks
    private CategoriaController categoriaController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoriaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void updateCategoria_ShouldReturn200_WhenValid() throws Exception {
        setup();

        CategoriaCreateDTO request = new CategoriaCreateDTO("Nova Categoria");
        Categoria updated = new Categoria(1L, "Nova Categoria", null);

        when(catalogService.updateCategory(1L, request)).thenReturn(updated);

        mockMvc.perform(put("/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/categories/1"));
    }

    @Test
    void updateCategoria_ShouldReturn409_WhenNameAlreadyExists() throws Exception {
        setup();

        CategoriaCreateDTO request = new CategoriaCreateDTO("Categoria Existente");

        when(catalogService.updateCategory(1L, request)).thenThrow(new ResourceAlreadyExistsException("Category name already exists"));

        mockMvc.perform(put("/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteCategoria_ShouldReturn204_WhenNotLinked() throws Exception {
        setup();

        doNothing().when(catalogService).deleteCategory(1L);

        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteCategoria_ShouldReturn422_WhenLinked() throws Exception {
        setup();

        doThrow(new BusinessException("Category is linked to products and cannot be deleted")).when(catalogService).deleteCategory(1L);

        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isUnprocessableEntity());
    }
}
