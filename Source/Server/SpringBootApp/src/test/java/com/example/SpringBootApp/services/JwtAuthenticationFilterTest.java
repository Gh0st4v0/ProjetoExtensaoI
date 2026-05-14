package com.example.SpringBootApp.services;

import com.example.SpringBootApp.infra.JwtAuthenticationFilter;
import com.example.SpringBootApp.infra.JwtTokenProvider;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    JwtTokenProvider tokenProvider;

    @Mock
    UsuarioRepository usuarioRepository;

    @InjectMocks
    JwtAuthenticationFilter filter;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    FilterChain filterChain;

    @Test
    void doFilterInternal_setsSecurityContext_whenValidToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer validtoken");
        when(tokenProvider.validateToken("validtoken")).thenReturn(true);
        when(tokenProvider.getUsernameFromToken("validtoken")).thenReturn("bob");

        Usuario u = new Usuario();
        u.setId(5L);
        u.setNome("bob");

        when(usuarioRepository.findByNome("bob")).thenReturn(Optional.of(u));

        // clear context
        SecurityContextHolder.clearContext();

        // doFilterInternal is protected; call doFilter which delegates to it
filter.doFilter(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
    }
}
