package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.models.Permissao;
import com.example.SpringBootApp.repositories.ClienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ClienteServicePermissoesTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;


    @Test
    void permissoes_parsingVariedTypes() {
        Cliente c = new Cliente();
        c.setId(5L);
        c.setNickname("Ana");

        when(clienteRepository.findByNicknameNot(eq("APAGADO"), org.mockito.ArgumentMatchers.any(org.springframework.data.domain.Sort.class))).thenReturn(List.of(c));

        // construct service and inject jdbcTemplate mock via reflection
        com.example.SpringBootApp.services.ClienteService clienteService = new com.example.SpringBootApp.services.ClienteService(clienteRepository);
        try {
            java.lang.reflect.Field f = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("jdbcTemplate");
            f.setAccessible(true);
            f.set(clienteService, jdbcTemplate);
            Object injected = f.get(clienteService);
            assertNotNull(injected, "jdbcTemplate should be injected");
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            fail("Reflection failure: " + ex.getMessage());
        }

        Map<String, Object> r1 = new HashMap<>();
        r1.put("tipo", "RECEBER_PROMOCOES");
        r1.put("aceito", true);

        Map<String, Object> r2 = new HashMap<>();
        r2.put("tipo", "TERMOS_SERVICO");
        r2.put("aceito", 1);

        Map<String, Object> r3 = new HashMap<>();
        r3.put("tipo", "IGNORAR");
        r3.put("aceito", true);

        when(jdbcTemplate.queryForList(anyString(), org.mockito.ArgumentMatchers.any(Object[].class))).thenReturn(List.of(r1, r2, r3));

        List<ClienteResponseDTO> dtos = clienteService.listAll();
        assertEquals(1, dtos.size());
        List<Permissao> perms = dtos.get(0).getPermissoes();
        assertTrue(perms.contains(Permissao.RECEBER_PROMOCOES), "perms: " + perms);
        assertTrue(perms.contains(Permissao.TERMOS_SERVICO), "perms: " + perms);
        assertEquals(2, perms.size(), "perms: " + perms);
    }

    @Test
    void permissoes_revokedExcluded() {
        Cliente c = new Cliente();
        c.setId(6L);
        c.setNickname("Bob");

        when(clienteRepository.findByNicknameNot(eq("APAGADO"), org.mockito.ArgumentMatchers.any(org.springframework.data.domain.Sort.class))).thenReturn(List.of(c));

        // construct service and inject jdbcTemplate mock
        com.example.SpringBootApp.services.ClienteService clienteService = new com.example.SpringBootApp.services.ClienteService(clienteRepository);
        try {
            java.lang.reflect.Field f = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("jdbcTemplate");
            f.setAccessible(true);
            f.set(clienteService, jdbcTemplate);
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            fail("Reflection failure: " + ex.getMessage());
        }

        Map<String, Object> r1 = new HashMap<>();
        r1.put("tipo", "RECEBER_PROMOCOES");
        r1.put("aceito", false);

        when(jdbcTemplate.queryForList(anyString(), org.mockito.ArgumentMatchers.any(Object[].class))).thenReturn(List.of(r1));

        List<ClienteResponseDTO> dtos = clienteService.listAll();
        assertEquals(1, dtos.size());
        List<Permissao> perms = dtos.get(0).getPermissoes();
        assertTrue(perms.isEmpty());
    }
}
