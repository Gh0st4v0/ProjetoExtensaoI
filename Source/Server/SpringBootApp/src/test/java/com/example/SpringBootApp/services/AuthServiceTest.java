package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.AutenticacaoResponseDTO;
import com.example.SpringBootApp.DTOs.LoginDTO;
import com.example.SpringBootApp.DTOs.MessageResponseDTO;
import com.example.SpringBootApp.DTOs.PasswordRecoveryRequestDTO;
import com.example.SpringBootApp.models.AccessLevel;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.RecuperacaoSenhaTokenRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import com.example.SpringBootApp.infra.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UsuarioRepository usuarioRepository;

    @Mock
    RecuperacaoSenhaTokenRepository recuperacaoSenhaTokenRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtTokenProvider tokenProvider;

    @Mock
    EmailService emailService;

    @InjectMocks
    AuthService authService;

    @Test
    void authenticate_returnsToken_whenCredentialsValid() {
        LoginDTO login = new LoginDTO();
        login.setIdentifier("user");
        login.setPassword("pass");

        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("user");
        usuario.setSenha("encoded");
        usuario.setAccessLevel(AccessLevel.USUARIO);

        when(usuarioRepository.findByNome("user")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("pass", "encoded")).thenReturn(true);
        when(tokenProvider.generateToken(usuario)).thenReturn("token123");

        AutenticacaoResponseDTO resp = authService.authenticate(login);

        assertEquals("token123", resp.getToken());
        assertEquals("Bearer", resp.getType());
        assertEquals(1L, resp.getUserId());
        assertEquals("user", resp.getUserName());
    }

    @Test
    void requestPasswordRecovery_returnsGeneric_whenUserNotFound() {
        PasswordRecoveryRequestDTO req = new PasswordRecoveryRequestDTO();
        req.setEmail("noone@example.com");

        when(usuarioRepository.findByEmail("noone@example.com")).thenReturn(Optional.empty());

        MessageResponseDTO resp = authService.requestPasswordRecovery(req);
        assertNotNull(resp);
        assertTrue(resp.getMessage().contains("If your email is registered"));
    }
}
