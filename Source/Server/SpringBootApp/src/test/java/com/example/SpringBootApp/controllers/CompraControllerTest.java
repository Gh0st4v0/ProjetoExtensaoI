package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraItemDTO;
import com.example.SpringBootApp.models.Compra;
import com.example.SpringBootApp.services.InventarioService;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
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
import java.time.LocalDate;
import java.util.List;

import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.exceptions.BusinessException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CompraControllerTest {

    private MockMvc mockMvc;

    @Mock
    private InventarioService inventarioService;

    @InjectMocks
    private CompraController compraController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(compraController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createCompra_ShouldReturn201_WhenValidInput() throws Exception {
        // Arrange
        CompraItemDTO item1 = new CompraItemDTO(
                1L,
                new BigDecimal("10.5"),
                new BigDecimal("45.90"),
                LocalDate.of(2024, 2, 15)
        );

        CompraItemDTO item2 = new CompraItemDTO(
                2L,
                new BigDecimal("5.0"),
                new BigDecimal("32.50"),
                LocalDate.of(2024, 3, 1)
        );

        CompraCreateDTO request =
                new CompraCreateDTO(LocalDate.of(2024, 1, 15), List.of(item1, item2));

        Compra savedCompra = new Compra(1L, LocalDate.of(2024, 1, 15), null);

        when(inventarioService.createPurchase(any(CompraCreateDTO.class))).thenReturn(savedCompra);

        // Act & Assert
        mockMvc.perform(post("/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", "/purchases/1"));
    }

    @Test
    void createCompra_ShouldReturn404_WhenProdutoNotFound() throws Exception {
        // Arrange
        CompraItemDTO item = new CompraItemDTO(
                999L,
                new BigDecimal("10.5"),
                new BigDecimal("45.90"),
                null
        );

        CompraCreateDTO request =
                new CompraCreateDTO(LocalDate.now(), List.of(item));

        when(inventarioService.createPurchase(any(CompraCreateDTO.class)))
                .thenThrow(new ResourceNotFoundException("Product not found with id: 999"));

        // Act & Assert
        mockMvc.perform(post("/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product not found with id: 999"));
    }

    @Test
    void createCompra_ShouldReturn400_WhenEmptyItemsList() throws Exception {
        // Arrange
        String invalidJson = """
        {
            "date": "2024-01-15",
            "items": []
        }
        """;

        // Act & Assert
        mockMvc.perform(post("/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCompra_ShouldReturn400_WhenMissingRequiredFields() throws Exception {
        // Arrange
        String invalidJson = """
        {
            "date": "2024-01-15",
            "items": [
                {
                    "quantity": 10.5,
                    "unitPurchasePrice": 45.90
                }
            ]
        }
        """;

        // Act & Assert
        mockMvc.perform(post("/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCompra_ShouldReturn400_WhenNegativePrice() throws Exception {
        // Arrange
        String invalidJson = """
        {
            "date": "2024-01-15",
            "items": [
                {
                    "productId": 1,
                    "quantity": 10.5,
                    "unitPurchasePrice": -45.90
                }
            ]
        }
        """;

        // Act & Assert
        mockMvc.perform(post("/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateCompraItem_ShouldReturn200_WhenValidInput() throws Exception {
        setup();

        String json = "{\"quantity\":1.0, \"unitPurchasePrice\": 10.5, \"expiringDate\": \"2024-02-15\"}";

        Movimentacao updated = new Movimentacao();
        updated.setId(10L);

        when(inventarioService.updatePurchaseItem(eq(1L), eq(1L), any(BigDecimal.class), any(BigDecimal.class), any(java.time.LocalDate.class))).thenReturn(updated);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/purchases/1/items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void updateCompraItem_ShouldReturn422_WhenStockNegative() throws Exception {
        setup();

        String json = "{\"quantity\":1.0, \"unitPurchasePrice\": 10.5, \"expiringDate\": \"2024-02-15\"}";

        doThrow(new BusinessException("Stock would become negative")).when(inventarioService).updatePurchaseItem(eq(1L), eq(1L), any(BigDecimal.class), any(BigDecimal.class), any(java.time.LocalDate.class));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/purchases/1/items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnprocessableEntity());
    }


}

