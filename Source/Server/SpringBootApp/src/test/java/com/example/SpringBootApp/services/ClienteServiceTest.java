package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.repositories.ClienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private com.example.SpringBootApp.services.ClienteService clienteService;

    @Test
    void createClient_savesAndReturns() {
        Cliente c = new Cliente();
        c.setId(1L);
        c.setNickname("Joao");

        when(clienteRepository.save(any(Cliente.class))).thenReturn(c);

        ClienteCreateDTO dto = new ClienteCreateDTO("Joao", null, null, null);
        Cliente saved = clienteService.createClient(dto);
        assertEquals(1L, saved.getId());
        assertEquals("Joao", saved.getNickname());
    }

    @Test
    void searchClients_returnsPage() {
        Cliente c = new Cliente();
        c.setId(2L);
        c.setNickname("Maria");

        Page<Cliente> page = new PageImpl<>(List.of(c), PageRequest.of(0,10), 1);
        when(clienteRepository.findByNicknameContainingIgnoreCase(eq("ma"), any(Pageable.class))).thenReturn(page);

        var result = clienteService.searchClients("ma", 0);
        assertEquals(1, result.getTotalElements());
        assertEquals(2L, result.getContent().get(0).getId().longValue());
        assertEquals("Maria", result.getContent().get(0).getNickname());
    }
}
