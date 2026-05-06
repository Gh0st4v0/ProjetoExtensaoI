package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.models.Compra;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Produto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CompraControllerListTest {

    private MockMvc mockMvc;

    @Mock
    private com.example.SpringBootApp.services.InventarioService inventarioService;

    @Mock
    private com.example.SpringBootApp.repositories.CompraRepository compraRepository;

    @InjectMocks
    private CompraController compraController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        org.springframework.test.util.ReflectionTestUtils.setField(compraController, "compraRepository", compraRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(compraController)
                .setControllerAdvice(new com.example.SpringBootApp.exceptions.GlobalExceptionHandler())
                .build();
    }

    @Test
    void getPurchases_ShouldReturnPagedList() throws Exception {
        // Arrange: create a Compra with one Movimentacao
        Produto produto = new Produto();
        produto.setId(1L);

        Movimentacao mov = new Movimentacao();
        mov.setQuantidade(new BigDecimal("2"));
        mov.setPrecoUnitarioCompra(new BigDecimal("10.00"));
        mov.setProduto(produto);

        Compra compra = new Compra();
        compra.setId(1L);
        compra.setDataCompra(LocalDate.of(2024, 1, 1));
        compra.setItens(List.of(mov));

        PageImpl<Compra> page = new PageImpl<>(List.of(compra), PageRequest.of(0, 10), 1);

        when(compraRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/purchases?page=0"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].totalValue").value(20.0));
    }
}
