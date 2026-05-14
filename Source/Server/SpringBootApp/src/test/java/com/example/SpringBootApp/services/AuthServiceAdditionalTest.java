package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ResetPasswordDTO;
import com.example.SpringBootApp.DTOs.ValidateRecoveryCodeDTO;
import com.example.SpringBootApp.models.RecuperacaoSenhaToken;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.RecuperacaoSenhaTokenRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceAdditionalTest {

    @Mock
    RecuperacaoSenhaTokenRepository recuperacaoSenhaTokenRepository;

    @Mock
    UsuarioRepository usuarioRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    EmailService emailService;

    @InjectMocks
    AuthService authService;

    @Test
    void resetPassword_success() {
        ResetPasswordDTO req = new ResetPasswordDTO();
        req.setToken("tkn");
        req.setNewPassword("newpass");

        Usuario u = new Usuario();
        u.setId(2L);
        u.setNome("bob");

        RecuperacaoSenhaToken token = new RecuperacaoSenhaToken();
        token.setToken("tkn");
        token.setUsuario(u);
        token.setExpiracao(LocalDateTime.now().plusHours(1));
        token.setUtilizado(false);
        token.setCriadoEm(LocalDateTime.now());

        when(recuperacaoSenhaTokenRepository.findByToken("tkn")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newpass")).thenReturn("encodedNew");

        var resp = authService.resetPassword(req);
        assertNotNull(resp);
        assertTrue(resp.getMessage().toLowerCase().contains("password reset"));
        verify(usuarioRepository, atLeastOnce()).save(any());
        verify(recuperacaoSenhaTokenRepository, atLeastOnce()).save(any());
    }

    @Test
    void validateRecoveryCode_success() {
        ValidateRecoveryCodeDTO req = new ValidateRecoveryCodeDTO();
        req.setToken("code1");

        RecuperacaoSenhaToken token = new RecuperacaoSenhaToken();
        token.setToken("code1");
        token.setExpiracao(LocalDateTime.now().plusHours(1));
        token.setUtilizado(false);

        when(recuperacaoSenhaTokenRepository.findByToken("code1")).thenReturn(Optional.of(token));

        var resp = authService.validateRecoveryCode(req);
        assertNotNull(resp);
        assertEquals("Valid token", resp.getMessage());
    }
}
