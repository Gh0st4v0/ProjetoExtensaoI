package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.MarcaCreateDTO;
import com.example.SpringBootApp.models.Marca;
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
class MarcaControllerCrudTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogService;

    @InjectMocks
    private MarcaController marcaController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(marcaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void updateMarca_ShouldReturn200_WhenValid() throws Exception {
        setup();

        MarcaCreateDTO request = new MarcaCreateDTO("Nova Marca");
        Marca updated = new Marca(1L, "Nova Marca", null);

        when(catalogService.updateBrand(1L, request)).thenReturn(updated);

        mockMvc.perform(put("/brands/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/brands/1"));
    }

    @Test
    void updateMarca_ShouldReturn409_WhenNameAlreadyExists() throws Exception {
        setup();

        MarcaCreateDTO request = new MarcaCreateDTO("Marca Existente");

        when(catalogService.updateBrand(1L, request)).thenThrow(new ResourceAlreadyExistsException("Brand name already exists"));

        mockMvc.perform(put("/brands/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteMarca_ShouldReturn204_WhenNotLinked() throws Exception {
        setup();

        doNothing().when(catalogService).deleteBrand(1L);

        mockMvc.perform(delete("/brands/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteMarca_ShouldReturn422_WhenLinked() throws Exception {
        setup();

        doThrow(new BusinessException("Category is linked to products and cannot be deleted")).when(catalogService).deleteBrand(1L);

        mockMvc.perform(delete("/brands/1"))
                .andExpect(status().isUnprocessableEntity());
    }
}
