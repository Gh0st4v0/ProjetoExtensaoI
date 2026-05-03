package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ProdutoPrecoUpdateDTO;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.services.CatalogoService;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProdutoControllerPriceUpdateTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogoService;

    @InjectMocks
    private ProdutoController produtoController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(produtoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void updatePrice_ShouldReturn200_WhenValid() throws Exception {
        ProdutoPrecoUpdateDTO dto = new ProdutoPrecoUpdateDTO(new BigDecimal("12.50"));
        Produto p = new Produto();
        p.setId(1L);
        p.setPrecoVenda(new BigDecimal("12.50"));

        when(catalogoService.updateProductPrice(1L, dto.getPrecoVenda())).thenReturn(p);

        mockMvc.perform(patch("/products/1/price")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/products/1"));
    }

    @Test
    void updatePrice_ShouldReturn404_WhenNotFound() throws Exception {
        ProdutoPrecoUpdateDTO dto = new ProdutoPrecoUpdateDTO(new BigDecimal("12.50"));
        when(catalogoService.updateProductPrice(1L, dto.getPrecoVenda())).thenThrow(new ResourceNotFoundException("Product not found"));

        mockMvc.perform(patch("/products/1/price")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found"));
    }

    @Test
    void updatePrice_ShouldReturn400_WhenValidationFails() throws Exception {
        String invalidJson = "{}";
        mockMvc.perform(patch("/products/1/price")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
