package com.example.SpringBootApp.infra;

import com.example.SpringBootApp.models.AccessLevel;
import com.example.SpringBootApp.models.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    @Test
    void generateValidateAndParseToken() {
        JwtTokenProvider provider = new JwtTokenProvider();
        String secret = Base64.getEncoder().encodeToString("01234567890123456789012345678901".getBytes());
        ReflectionTestUtils.setField(provider, "jwtSecret", secret);
        // Ensure token doesn't expire immediately in tests
        ReflectionTestUtils.setField(provider, "jwtExpiration", 3600000L);

        Usuario u = new Usuario();
        u.setId(42L);
        u.setNome("alice");
        u.setAccessLevel(AccessLevel.USUARIO);

        String token = provider.generateToken(u);

        assertTrue(provider.validateToken(token));
        assertEquals("alice", provider.getUsernameFromToken(token));
        assertEquals(42L, provider.getUserIdFromToken(token));
    }
}
