package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.models.AccessLevel;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.RecuperacaoSenhaTokenRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RecuperacaoSenhaTokenRepository recuperacaoSenhaTokenRepository;

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

    // ── Helpers de autenticação ────────────────────────────────────────────────

    private Authentication adminAuth(Long id) {
        Usuario admin = new Usuario();
        admin.setId(id);
        admin.setAccessLevel(AccessLevel.ADM);
        return new UsernamePasswordAuthenticationToken(
                admin, null, List.of(new SimpleGrantedAuthority("ROLE_ADM")));
    }

    private Authentication userAuth(Long id) {
        Usuario user = new Usuario();
        user.setId(id);
        user.setAccessLevel(AccessLevel.USUARIO);
        return new UsernamePasswordAuthenticationToken(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_USUARIO")));
    }

    // ── GET /users ─────────────────────────────────────────────────────────────

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

    // ── POST /users ────────────────────────────────────────────────────────────

    @Test
    void createUser_returnsCreated() throws Exception {
        Map<String, Object> body = Map.of(
                "nome", "New User",
                "email", "new@example.com",
                "senha", "Password1!",
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
    void createUser_duplicateName_returns409() throws Exception {
        Usuario existing = new Usuario();
        existing.setId(1L);
        existing.setNome("Joao Silva");

        when(usuarioRepository.findByNome("Joao Silva")).thenReturn(Optional.of(existing));

        Map<String, Object> body = Map.of(
                "nome", "Joao Silva",
                "email", "outro@example.com",
                "senha", "Password1!"
        );

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("Joao Silva")));
    }

    @Test
    void createUser_duplicateEmail_returns409() throws Exception {
        when(usuarioRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(new Usuario()));

        Map<String, Object> body = Map.of(
                "nome", "Novo Usuario",
                "email", "taken@example.com",
                "senha", "Password1!"
        );

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("taken@example.com")));
    }

    @Test
    void createUser_dataIntegrityViolation_returns409() throws Exception {
        when(usuarioRepository.findByNome(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(usuarioRepository.save(any())).thenThrow(new DataIntegrityViolationException("unique constraint violation"));

        Map<String, Object> body = Map.of(
                "nome", "Corrida",
                "email", "corrida@example.com",
                "senha", "Password1!"
        );

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    // ── PUT /users/{id} ────────────────────────────────────────────────────────

    @Test
    void updateUser_asAdmin_returnsOk() throws Exception {
        Usuario existing = new Usuario();
        existing.setId(1L);
        existing.setNome("Old Name");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(usuarioRepository.save(any())).thenReturn(existing);

        Authentication auth = adminAuth(99L);

        mockMvc.perform(put("/users/1")
                        .with(req -> { req.setUserPrincipal(auth); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "New Name"))))
                .andExpect(status().isOk());

        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void updateUser_asOwner_returnsOk() throws Exception {
        Usuario existing = new Usuario();
        existing.setId(2L);

        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(usuarioRepository.save(any())).thenReturn(existing);

        Authentication auth = userAuth(2L);

        mockMvc.perform(put("/users/2")
                        .with(req -> { req.setUserPrincipal(auth); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Updated"))))
                .andExpect(status().isOk());
    }

    @Test
    void updateUser_asOtherUser_returnsForbidden() throws Exception {
        Authentication auth = userAuth(5L);

        mockMvc.perform(put("/users/2")
                        .with(req -> { req.setUserPrincipal(auth); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Hacked"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Você só pode editar o seu próprio perfil."));
    }

    @Test
    void updateUser_notFound_returns404() throws Exception {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        Authentication auth = adminAuth(1L);

        mockMvc.perform(put("/users/99")
                        .with(req -> { req.setUserPrincipal(auth); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "X"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: 99"));
    }

    @Test
    void updateUser_withPassword_encodesAndSaves() throws Exception {
        Usuario existing = new Usuario();
        existing.setId(1L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("newpass")).thenReturn("hashed_new");
        when(usuarioRepository.save(any())).thenReturn(existing);

        Authentication auth = adminAuth(99L);

        mockMvc.perform(put("/users/1")
                        .with(req -> { req.setUserPrincipal(auth); return req; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("senha", "newpass"))))
                .andExpect(status().isOk());

        verify(passwordEncoder).encode("newpass");
    }

    // ── DELETE /users/{id} ─────────────────────────────────────────────────────

    @Test
    void deleteUser_returnsNoContent_WhenExists() throws Exception {
        Usuario u = new Usuario();
        u.setId(2L);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(u));

        mockMvc.perform(delete("/users/2"))
                .andExpect(status().isNoContent());

        verify(recuperacaoSenhaTokenRepository).deleteByUsuario(u);
        verify(usuarioRepository).delete(u);
    }

    @Test
    void deleteUser_deletesRecoveryTokensBeforeUser() throws Exception {
        Usuario u = new Usuario();
        u.setId(10L);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(u));

        mockMvc.perform(delete("/users/10"))
                .andExpect(status().isNoContent());

        // Garante que tokens são deletados ANTES do usuário
        var inOrder = inOrder(recuperacaoSenhaTokenRepository, usuarioRepository);
        inOrder.verify(recuperacaoSenhaTokenRepository).deleteByUsuario(u);
        inOrder.verify(usuarioRepository).delete(u);
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
