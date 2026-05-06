package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ProdutoCreateDTO;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
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

import java.math.BigDecimal;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProdutoControllerCrudTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogService;

    @InjectMocks
    private ProdutoController produtoController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(produtoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void updateProduto_ShouldReturn200_WhenValid() throws Exception {
        setup();

        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001010", false, new BigDecimal("10.00"), 1L, 1L);
        Produto updated = new Produto();
        updated.setId(1L);
        updated.setNome("Picanha");
        updated.setCodigo("001010");

        when(catalogService.updateProduct(1L, request)).thenReturn(updated);

        mockMvc.perform(put("/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/products/1"));
    }

    @Test
    void updateProduto_ShouldReturn409_WhenCodeAlreadyExists() throws Exception {
        setup();

        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001010", false, new BigDecimal("10.00"), 1L, 1L);

        when(catalogService.updateProduct(1L, request)).thenThrow(new ResourceAlreadyExistsException("Product code already exists"));

        mockMvc.perform(put("/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteProduto_ShouldReturn204_WhenNotLinked() throws Exception {
        setup();

        doNothing().when(catalogService).deleteProduct(1L);

        mockMvc.perform(delete("/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteProduto_ShouldReturn422_WhenLinked() throws Exception {
        setup();

        doThrow(new BusinessException("Product is linked to movimentacoes and cannot be deleted")).when(catalogService).deleteProduct(1L);

        mockMvc.perform(delete("/products/1"))
                .andExpect(status().isUnprocessableEntity());
    }
}
