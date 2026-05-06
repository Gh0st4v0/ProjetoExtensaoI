package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.MarcaCreateDTO;
import com.example.SpringBootApp.DTOs.MarcaDTO;
import com.example.SpringBootApp.models.Marca;
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
class MarcaControllerTest {

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
    void createMarca_ShouldReturn201_WhenValidInput() throws Exception {
        setup();

        // Arrange
        MarcaCreateDTO request = new MarcaCreateDTO("Nova Marca");
        Marca savedMarca = new Marca(1L, "Nova Marca", null);

        when(catalogService.createBrand(any(MarcaCreateDTO.class))).thenReturn(savedMarca);

        // Act & Assert
        mockMvc.perform(post("/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", "/brands/1"));
    }

    @Test
    void createMarca_ShouldReturn409_WhenNameAlreadyExists() throws Exception {
        setup();

        // Arrange
        MarcaCreateDTO request = new MarcaCreateDTO("Marca Existente");

        when(catalogService.createBrand(any(MarcaCreateDTO.class)))
                .thenThrow(new ResourceAlreadyExistsException("Brand name already exists"));

        // Act & Assert
        mockMvc.perform(post("/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Brand name already exists"));
    }

    @Test
    void createMarca_ShouldReturn400_WhenInvalidInput() throws Exception {
        setup();

        // Arrange
        String invalidJson = "{\"name\": \"\"}";

        // Act & Assert
        mockMvc.perform(post("/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllBrands_ShouldReturn200_WithListOfBrands() throws Exception {
        setup();

        // Arrange
        MarcaDTO marca1 = new MarcaDTO();
        marca1.setId(1L);
        marca1.setBrandName("Friboi");

        MarcaDTO marca2 = new MarcaDTO();
        marca2.setId(2L);
        marca2.setBrandName("Sadia");

        List<MarcaDTO> brands = List.of(marca1, marca2);

        when(catalogService.getAllBrands()).thenReturn(brands);

        // Act & Assert
        mockMvc.perform(get("/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].brandName").value("Friboi"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].brandName").value("Sadia"));
    }

    @Test
    void getAllBrands_ShouldReturn200_WithEmptyList() throws Exception {
        setup();

        // Arrange
        when(catalogService.getAllBrands()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}

