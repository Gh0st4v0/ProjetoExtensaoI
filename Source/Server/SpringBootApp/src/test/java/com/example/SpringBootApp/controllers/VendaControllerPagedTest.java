package com.example.SpringBootApp.controllers;

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
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VendaControllerPagedTest {

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
    void getSalesPaged_returnsPage() throws Exception {
        VendaResponseDTO dto = new VendaResponseDTO();
        dto.setId(1L);
        dto.setUsuarioNome("User One");
        PageImpl<VendaResponseDTO> page = new PageImpl<>(List.of(dto));

        when(vendaService.listSales(0, 10)).thenReturn(page);

        // Try serializing directly to reproduce the JSON issue outside MockMvc
        try {
            String json = objectMapper.writeValueAsString(page);
            System.out.println("Serialized page JSON: " + json);
        } catch (Exception e) {
            e.printStackTrace();
        }

        mockMvc.perform(get("/sales").param("page", "0").param("size", "10"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].usuarioNome").value("User One"));
    }
}
