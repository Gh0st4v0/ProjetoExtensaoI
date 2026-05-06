package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.services.ClienteService;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClienteControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClienteService clienteService;

    @InjectMocks
    private ClienteController clienteController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(clienteController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createClient_returns201() throws Exception {
        ClienteCreateDTO dto = new ClienteCreateDTO("Joao");
        com.example.SpringBootApp.models.Cliente saved = new com.example.SpringBootApp.models.Cliente();
        saved.setId(1L);
        saved.setNickname("Joao");

        when(clienteService.createClient(dto)).thenReturn(saved);

        mockMvc.perform(post("/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/clients/1"));
    }

    @Test
    void searchClients_returnsPage() throws Exception {
        ClienteResponseDTO r = new ClienteResponseDTO();
        r.setId(2L);
        r.setNickname("Maria");
        Page<ClienteResponseDTO> page = new PageImpl<>(List.of(r), PageRequest.of(0,10), 1);
        when(clienteService.searchClients("ma",0)).thenReturn(page);

        mockMvc.perform(get("/clients/search").param("q","ma").param("page","0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(2))
                .andExpect(jsonPath("$.content[0].nickname").value("Maria"));
    }
}
