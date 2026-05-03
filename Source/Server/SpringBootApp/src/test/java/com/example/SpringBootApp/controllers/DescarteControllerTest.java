package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.models.Descarte;
import com.example.SpringBootApp.models.DescarteType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DescarteControllerTest {

    private MockMvc mockMvc;

    @Mock
    private com.example.SpringBootApp.services.InventarioService inventarioService;

    @InjectMocks
    private DescarteController descarteController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(descarteController)
                .setControllerAdvice(new com.example.SpringBootApp.exceptions.GlobalExceptionHandler())
                .build();
    }

    @Test
    void createDiscard_ShouldReturn201_WhenValidInput() throws Exception {
        com.example.SpringBootApp.DTOs.DescarteItemDTO item = new com.example.SpringBootApp.DTOs.DescarteItemDTO(1L, 1L, new BigDecimal("2"));
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dto = new com.example.SpringBootApp.DTOs.DescarteCreateDTO(null, DescarteType.PERDA_PESO, List.of(item));

        Descarte saved = new Descarte();
        saved.setId(100L);

        when(inventarioService.createDiscard(any(com.example.SpringBootApp.DTOs.DescarteCreateDTO.class))).thenReturn(saved);

        mockMvc.perform(post("/discards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/discards/100"));
    }

    @Test
    void createDiscard_ShouldReturn422_WhenStockNegative() throws Exception {
        com.example.SpringBootApp.DTOs.DescarteItemDTO item = new com.example.SpringBootApp.DTOs.DescarteItemDTO(1L, 1L, new BigDecimal("2"));
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dto = new com.example.SpringBootApp.DTOs.DescarteCreateDTO(null, DescarteType.PERDA_PESO, List.of(item));

        org.mockito.Mockito.doThrow(new com.example.SpringBootApp.exceptions.BusinessException("Stock would become negative"))
                .when(inventarioService).createDiscard(any(com.example.SpringBootApp.DTOs.DescarteCreateDTO.class));

        mockMvc.perform(post("/discards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnprocessableEntity());
    }
}
