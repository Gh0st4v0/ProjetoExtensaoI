package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.DTOs.VendReportDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.models.PaymentMethod;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.services.RelatorioService;
import com.example.SpringBootApp.services.VendaService;
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
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VendaControllerTest {

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
                .build();
    }

    @Test
    void createSale_ShouldReturn201_WhenValidInput() throws Exception {
        // Arrange
        VendItemDTO itemDTO = new VendItemDTO(1L, 1L, new BigDecimal("2.5"), null);
        List<VendItemDTO> items = List.of(itemDTO);
        
        VendCreateDTO request = new VendCreateDTO(
                LocalDate.now(),
                PaymentMethod.DINHEIRO,
                false,
                1L,
                null,
                items
        );
        
        Venda savedVenda = new Venda();
        savedVenda.setId(1L);

        when(vendaService.createSale(any(VendCreateDTO.class))).thenReturn(savedVenda);

        // Act & Assert
        mockMvc.perform(post("/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", "/sales/1"));
    }

    @Test
    void createSale_ShouldReturn404_WhenUsuarioNotFound() throws Exception {
        // Arrange
        VendItemDTO itemDTO = new VendItemDTO(1L, 1L, new BigDecimal("2.5"), null);
        List<VendItemDTO> items = List.of(itemDTO);
        
        VendCreateDTO request = new VendCreateDTO(
                LocalDate.now(),
                PaymentMethod.DINHEIRO,
                false,
                999L,
                null,
                items
        );

        when(vendaService.createSale(any(VendCreateDTO.class)))
                .thenThrow(new ResourceNotFoundException("Usuario not found"));

        // Act & Assert
        mockMvc.perform(post("/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Usuario not found"));
    }

    @Test
    void createSale_ShouldReturn404_WhenProdutoNotFound() throws Exception {
        // Arrange
        VendItemDTO itemDTO = new VendItemDTO(999L, 1L, new BigDecimal("2.5"), null);
        List<VendItemDTO> items = List.of(itemDTO);
        
        VendCreateDTO request = new VendCreateDTO(
                LocalDate.now(),
                PaymentMethod.DINHEIRO,
                false,
                1L,
                null,
                items
        );

        when(vendaService.createSale(any(VendCreateDTO.class)))
                .thenThrow(new ResourceNotFoundException("Produto not found with id: 999"));

        // Act & Assert
        mockMvc.perform(post("/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Produto not found with id: 999"));
    }

    @Test
    void createSale_ShouldReturn400_WhenInvalidInput() throws Exception {
        // Arrange
        String invalidJson = "{}";

        // Act & Assert
        mockMvc.perform(post("/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getSalesReport_ShouldReturn200_WhenValidDateRange() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 1, 31);
        
        VendReportDTO reportDTO = new VendReportDTO();
        reportDTO.setId(1L);
        reportDTO.setSaleDate(LocalDate.of(2026, 1, 15));
        reportDTO.setPaymentMethod("DINHEIRO");
        reportDTO.setSalesmanName("Test User");
        reportDTO.setHasDiscount(false);
        reportDTO.setTotalPrice(new BigDecimal("150.00"));
        reportDTO.setTotalCost(new BigDecimal("100.00"));
        reportDTO.setItems(new ArrayList<>());
        
        List<VendReportDTO> reports = List.of(reportDTO);

        when(relatorioService.getSalesReport(startDate, endDate)).thenReturn(reports);

        // Act & Assert
        mockMvc.perform(get("/sales")
                        .param("startDate", startDate.toString())
                        .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].paymentMethod").value("DINHEIRO"))
                .andExpect(jsonPath("$[0].salesmanName").value("Test User"))
                .andExpect(jsonPath("$[0].totalPrice").value(150.00))
                .andExpect(jsonPath("$[0].totalCost").value(100.00));
    }

    @Test
    void getSalesReport_ShouldReturnEmptyList_WhenNoSalesInRange() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 1, 31);
        
        when(relatorioService.getSalesReport(startDate, endDate)).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/sales")
                        .param("startDate", startDate.toString())
                        .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}

