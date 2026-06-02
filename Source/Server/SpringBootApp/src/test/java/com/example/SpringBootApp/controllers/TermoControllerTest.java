package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.models.Termo;
import com.example.SpringBootApp.services.TermoService;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.DTOs.TermoCreateDTO;
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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TermoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TermoService termoService;

    @InjectMocks
    private TermoController termoController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(termoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createTermo_returns201_andLocation() throws Exception {
        Termo t = new Termo();
        t.setId(42L);
        t.setConteudo("conteudo de teste");
        t.setCriadoEm(LocalDateTime.now());

        when(termoService.createTermo(any())).thenReturn(t);

        TermoCreateDTO dto = new TermoCreateDTO(t.getConteudo());

        mockMvc.perform(post("/termos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/termos/42"));
    }

    @Test
    void getLatestTermo_returns200_andBody() throws Exception {
        Termo t = new Termo(7L, "latest content", LocalDateTime.now());
        when(termoService.getLatestTermo()).thenReturn(Optional.of(t));

        mockMvc.perform(get("/termos/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.conteudo").value("latest content"));
    }

    @Test
    void getLatestTermo_returns404_whenNotFound() throws Exception {
        when(termoService.getLatestTermo()).thenReturn(Optional.empty());

        mockMvc.perform(get("/termos/latest"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getTermoById_returns200_andBody() throws Exception {
        Termo t = new Termo(5L, "by id content", LocalDateTime.now());
        when(termoService.getTermoById(5L)).thenReturn(t);

        mockMvc.perform(get("/termos/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.conteudo").value("by id content"));
    }

    @Test
    void getTermoById_returns404_whenNotFound() throws Exception {
        when(termoService.getTermoById(999L)).thenThrow(new com.example.SpringBootApp.exceptions.ResourceNotFoundException("not"));

        mockMvc.perform(get("/termos/999"))
                .andExpect(status().isNotFound());
    }
}
