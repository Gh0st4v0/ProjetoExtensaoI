package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.DespesaCreateDTO;
import com.example.SpringBootApp.models.Despesa;
import com.example.SpringBootApp.repositories.DespesaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DespesaServiceTest {

    @Mock
    private DespesaRepository despesaRepository;

    @InjectMocks
    private DespesaService despesaService;

    @Test
    void createDespesa_saves_and_returns() {
        DespesaCreateDTO dto = new DespesaCreateDTO();
        dto.setDescricao("Compra material");
        dto.setCategoria("Operacional");
        dto.setValor(new BigDecimal("50.00"));
        dto.setDataDespesa(LocalDate.of(2026,1,1));

        when(despesaRepository.save(any())).thenAnswer(i -> { Despesa d = i.getArgument(0); d.setId(1L); return d; });

        Despesa saved = despesaService.createDespesa(dto, 5L);

        assertEquals(1L, saved.getId());
        assertEquals("Compra material", saved.getDescricao());
        assertEquals(new BigDecimal("50.00"), saved.getValor());
        verify(despesaRepository, times(1)).save(any());
    }

    @Test
    void listByDateRange_callsRepository() {
        LocalDate start = LocalDate.of(2026,1,1);
        LocalDate end = LocalDate.of(2026,1,31);
        despesaService.listByDateRange(start, end);
        verify(despesaRepository, times(1)).findByDataDespesaBetween(any(), any());
    }
}
