package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.VendaItemResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.services.VendaService;
import com.example.SpringBootApp.services.RelatorioService;
import com.example.SpringBootApp.controllers.VendaController;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
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
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VendaControllerGetByIdTest {

    private MockMvc mockMvc;

    @Mock
    private VendaService vendaService;

    @Mock
    private RelatorioService relatorioService;

    @InjectMocks
    private VendaController vendaController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(vendaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void getSaleById_returnsDto() throws Exception {
        VendaResponseDTO dto = new VendaResponseDTO();
        dto.setId(1L);
        dto.setUsuarioNome("User One");
        VendaItemResponseDTO item = new VendaItemResponseDTO();
        item.setProductId(5L);
        item.setQuantity(new BigDecimal("2"));
        dto.setItems(List.of(item));

        when(vendaService.getSaleById(1L)).thenReturn(dto);

        mockMvc.perform(get("/sales/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.usuarioNome").value("User One"))
                .andExpect(jsonPath("$.items[0].productId").value(5));
    }
}
