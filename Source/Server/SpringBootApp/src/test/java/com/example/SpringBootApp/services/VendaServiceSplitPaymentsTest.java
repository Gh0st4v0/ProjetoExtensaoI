package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.DTOs.VendPaymentDTO;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceSplitPaymentsTest {

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

    @InjectMocks
    private VendaService vendaService;

    @Test
    void createSale_withSplitPayments_appliesCreditSurchargeAndPersistsPayments() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId);
        when(compraRepository.findAll()).thenReturn(List.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("1.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("1.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("5.00"));
        stockItem.setPrecoUnitarioVenda(new BigDecimal("100.00"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stockItem));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(stockItem.getQuantidade());

        VendItemDTO item = new VendItemDTO(null, productId, new BigDecimal("1.0000"), new BigDecimal("100.00"));
        VendCreateDTO saleDTO = new VendCreateDTO();
        saleDTO.setSaleDate(LocalDate.now());
        saleDTO.setUserId(userId);
        saleDTO.setItems(List.of(item));

        // payments: PIX 30, CREDITO 70
        VendPaymentDTO p1 = new VendPaymentDTO(PaymentMethod.PIX, new BigDecimal("30.00"), null, null);
        VendPaymentDTO p2 = new VendPaymentDTO(PaymentMethod.CREDITO, new BigDecimal("70.00"), null, null);
        saleDTO.setPayments(List.of(p1, p2));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(900L); return v; });

        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));
        when(vendaPagamentoRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        // verify payments persisted
        ArgumentCaptor<VendaPagamento> captor = ArgumentCaptor.forClass(VendaPagamento.class);
        verify(vendaPagamentoRepository, times(2)).save(captor.capture());
        List<VendaPagamento> savedPayments = captor.getAllValues();

        // find credit payment
        VendaPagamento credit = savedPayments.stream().filter(p -> p.getMetodoPagamento() == PaymentMethod.CREDITO).findFirst().orElse(null);
        assertNotNull(credit);
        assertEquals(new BigDecimal("70.0000"), credit.getValor().setScale(4));
        assertEquals(new BigDecimal("3.5000"), credit.getAcrescimoValor());
        assertEquals(new BigDecimal("73.5000"), credit.getValorPago());
    }

}
