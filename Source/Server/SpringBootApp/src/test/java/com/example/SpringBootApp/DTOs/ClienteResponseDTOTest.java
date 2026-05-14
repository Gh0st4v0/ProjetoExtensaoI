package com.example.SpringBootApp.DTOs;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ClienteResponseDTOTest {

    @Test
    void lombokMethods() {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.setId(99L);
        dto.setNickname("Nick");
        dto.setTelefone("123");
        dto.setDocumento("doc");
        dto.setEmail("e@e.com");
        dto.setDataCadastro(LocalDateTime.of(2024,1,1,10,0));

        assertEquals(Long.valueOf(99L), dto.getId());
        assertEquals("Nick", dto.getNickname());
        assertEquals("123", dto.getTelefone());
        assertEquals("doc", dto.getDocumento());
        assertEquals("e@e.com", dto.getEmail());
        assertEquals(LocalDateTime.of(2024,1,1,10,0), dto.getDataCadastro());
    }
}
