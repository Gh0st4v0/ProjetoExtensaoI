package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendPaymentDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceUpdatePaymentsTest {

    @Mock
    private VendaRepository vendaRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CompraRepository compraRepository;

    @Mock
    private com.example.SpringBootApp.repositories.ClienteRepository clienteRepository;

    @Mock
    private com.example.SpringBootApp.repositories.VendaPagamentoRepository vendaPagamentoRepository;

    @Mock
    private InventarioService inventarioService;

    @Mock
    private ConfiguracaoService configuracaoService;

    @InjectMocks
    private VendaService vendaService;

    @Test
    void updatePayments_throws_when_sum_exceeds() {
        Long id = 1000L;
        Venda venda = new Venda();
        venda.setId(id);
        venda.setValorTotal(new BigDecimal("100.00"));
        venda.setDataVenda(LocalDateTime.now());

        when(vendaRepository.findById(id)).thenReturn(Optional.of(venda));
        when(vendaPagamentoRepository.findByVendaId(id)).thenReturn(List.of());

        List<VendPaymentDTO> payments = List.of(new VendPaymentDTO(PaymentMethod.PIX, new BigDecimal("100.01"), null, null));

        BusinessException ex = assertThrows(BusinessException.class, () -> vendaService.updateSalePayments(id, payments));
        assertTrue(ex.getMessage().contains("Total dos pagamentos excede"));
    }

    @Test
    void updatePayments_adjusts_last_payment_for_split_rounding() {
        Long id = 2000L;
        Venda venda = new Venda();
        venda.setId(id);
        venda.setValorTotal(new BigDecimal("100.00"));
        venda.setDataVenda(LocalDateTime.now());

        when(vendaRepository.findById(id)).thenReturn(Optional.of(venda));
        when(vendaPagamentoRepository.findByVendaId(id)).thenReturn(List.of());
        when(vendaPagamentoRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        List<VendPaymentDTO> payments = List.of(
                new VendPaymentDTO(PaymentMethod.PIX, new BigDecimal("33.33"), null, null),
                new VendPaymentDTO(PaymentMethod.PIX, new BigDecimal("33.33"), null, null),
                new VendPaymentDTO(PaymentMethod.PIX, new BigDecimal("33.33"), null, null)
        );

        vendaService.updateSalePayments(id, payments);

        ArgumentCaptor<VendaPagamento> captor = ArgumentCaptor.forClass(VendaPagamento.class);
        verify(vendaPagamentoRepository, times(3)).save(captor.capture());
        List<VendaPagamento> saved = captor.getAllValues();
        VendaPagamento last = saved.get(2);
        assertEquals(0, last.getValor().setScale(4).compareTo(new BigDecimal("33.3400")));
    }
}
