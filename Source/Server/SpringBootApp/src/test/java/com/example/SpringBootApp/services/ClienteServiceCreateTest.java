package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.models.Termo;
import com.example.SpringBootApp.repositories.ClienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceCreateTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private TermoService termoService;

    @Test
    void createClient_throwsWhenTermsNotAccepted() {
        com.example.SpringBootApp.services.ClienteService service = new com.example.SpringBootApp.services.ClienteService(clienteRepository);

        ClienteCreateDTO dto = new ClienteCreateDTO("Ana", null, null);
        dto.setAceitaTermosServico(false);

        var ex = assertThrows(com.example.SpringBootApp.exceptions.BusinessException.class, () -> service.createClient(dto));
        assertTrue(ex.getMessage().toLowerCase().contains("termos"));
    }

    @Test
    void createClient_persistsConsent_withTermoAndPromo() throws Exception {
        // prepare
        com.example.SpringBootApp.services.ClienteService service = new com.example.SpringBootApp.services.ClienteService(clienteRepository);

        Cliente saved = new Cliente();
        saved.setId(123L);
        saved.setNickname("Ana");

        when(clienteRepository.save(any(Cliente.class))).thenReturn(saved);

        Termo termo = new Termo(77L, "content", LocalDateTime.now());
        when(termoService.getLatestTermo()).thenReturn(Optional.of(termo));

        // reflectively inject jdbcTemplate and termoService
        Field fJdbc = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("jdbcTemplate");
        fJdbc.setAccessible(true);
        fJdbc.set(service, jdbcTemplate);

        Field fTermo = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("termoService");
        fTermo.setAccessible(true);
        fTermo.set(service, termoService);

        ClienteCreateDTO dto = new ClienteCreateDTO("Ana", "9999", LocalDate.now().minusYears(20));
        dto.setAceitaTermosServico(true);
        dto.setReceberPromocoes(true);

        // act
        Cliente result = service.createClient(dto);

        assertEquals(123L, result.getId());

        // verify jdbcTemplate called twice (termos + receber promocoes)
        String expectedSql = "INSERT INTO consentimentos (fk_cliente_id, fk_usuario_id, tipo, aceito, fk_termo_id, capturado_em) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        verify(jdbcTemplate, times(2)).update(eq(expectedSql), any(Object.class), any(), any(), any(), any());

        // capture args
        ArgumentCaptor<Object[]> captor = ArgumentCaptor.forClass(Object[].class);
        verify(jdbcTemplate, times(2)).update(eq(expectedSql), captor.capture());
        var captured = captor.getAllValues();
        assertEquals(2, captured.size());

        Object[] first = captured.get(0);
        assertEquals(123L, ((Number) first[0]).longValue());
        assertEquals("TERMOS_SERVICO", first[2]);
        assertEquals(Boolean.TRUE, first[3]);
        assertEquals(77L, ((Number) first[4]).longValue());

        Object[] second = captured.get(1);
        assertEquals(123L, ((Number) second[0]).longValue());
        assertEquals("RECEBER_PROMOCOES", second[2]);
        assertEquals(Boolean.TRUE, second[3]);
        assertEquals(77L, ((Number) second[4]).longValue());
    }

    @Test
    void createClient_persistsConsent_withoutTermoIdWhenNotAvailable() throws Exception {
        com.example.SpringBootApp.services.ClienteService service = new com.example.SpringBootApp.services.ClienteService(clienteRepository);

        Cliente saved = new Cliente();
        saved.setId(555L);
        saved.setNickname("Bob");

        when(clienteRepository.save(any(Cliente.class))).thenReturn(saved);

        when(termoService.getLatestTermo()).thenReturn(Optional.empty());

        Field fJdbc = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("jdbcTemplate");
        fJdbc.setAccessible(true);
        fJdbc.set(service, jdbcTemplate);

        Field fTermo = com.example.SpringBootApp.services.ClienteService.class.getDeclaredField("termoService");
        fTermo.setAccessible(true);
        fTermo.set(service, termoService);

        ClienteCreateDTO dto = new ClienteCreateDTO("Bob", null, null);
        dto.setAceitaTermosServico(true);
        dto.setReceberPromocoes(null);

        Cliente res = service.createClient(dto);
        assertEquals(555L, res.getId());

        String expectedSql = "INSERT INTO consentimentos (fk_cliente_id, fk_usuario_id, tipo, aceito, fk_termo_id, capturado_em) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        // only one insert (TERMOS_SERVICO)
        verify(jdbcTemplate, times(1)).update(eq(expectedSql), any(Object.class), any(), any(), any(), any());

        ArgumentCaptor<Object[]> captor = ArgumentCaptor.forClass(Object[].class);
        verify(jdbcTemplate).update(eq(expectedSql), captor.capture());
        Object[] args = captor.getValue();
        assertEquals(555L, ((Number) args[0]).longValue());
        assertNull(args[4]); // termo id null
    }
}
