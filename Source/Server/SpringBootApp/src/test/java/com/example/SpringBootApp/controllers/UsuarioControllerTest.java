package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.models.AccessLevel;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioController usuarioController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(usuarioController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void listUsers_returnsUsers() throws Exception {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setNome("User One");
        u.setEmail("user@example.com");
        u.setAccessLevel(AccessLevel.ADM);

        when(usuarioRepository.findAll()).thenReturn(List.of(u));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("User One"))
                .andExpect(jsonPath("$[0].email").value("user@example.com"))
                .andExpect(jsonPath("$[0].nivelAcesso").value("ADM"));
    }

    @Test
    void createUser_returnsCreated() throws Exception {
        Map<String, Object> body = Map.of(
                "nome", "New User",
                "email", "new@example.com",
                "senha", "password",
                "nivelAcesso", "ADM"
        );

        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setId(5L);
            return u;
        });

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/users/5"));
    }

    @Test
    void deleteUser_returnsNoContent_WhenExists() throws Exception {
        Usuario u = new Usuario();
        u.setId(2L);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(u));

        mockMvc.perform(delete("/users/2"))
                .andExpect(status().isNoContent());

        verify(usuarioRepository).delete(u);
    }

    @Test
    void deleteUser_returnsNotFound_WhenMissing() throws Exception {
        when(usuarioRepository.findById(3L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/users/3"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: 3"));
    }
}
