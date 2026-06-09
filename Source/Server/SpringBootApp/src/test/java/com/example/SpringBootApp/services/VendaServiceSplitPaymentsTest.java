package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.DTOs.VendaPaymentDTO;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Mock
    private com.example.SpringBootApp.services.ConfiguracaoService configuracaoService;

    @BeforeEach
    void setUp() {
        Configuracao mockConfig = new Configuracao();
        mockConfig.setAcrescimoCredito(new BigDecimal("5.00"));
        mockConfig.setTaxaCredito(new BigDecimal("2.00"));
        mockConfig.setTaxaDebito(BigDecimal.ZERO);

        // any(LocalDateTime.class) blinda o teste contra diferenças de formatação ou fuso horário (GMT-03 / America/Sao_Paulo)
        lenient().when(configuracaoService.getConfiguracaoForDate(any(LocalDateTime.class)))
                .thenReturn(mockConfig);
    }

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
        VendaPaymentDTO p1 = new VendaPaymentDTO(
                PaymentMethod.PIX,
                new BigDecimal("30.00"),
                new BigDecimal("0"),
                new BigDecimal("0"),
                new BigDecimal("30.00"));
        VendaPaymentDTO p2 = new VendaPaymentDTO(
                PaymentMethod.CREDITO,
                new BigDecimal("70.00"),
                new BigDecimal("5"),
                new BigDecimal("3.50"),
                new BigDecimal("73.50"));
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
        assertEquals(new BigDecimal("70.00"), credit.getValor());
        assertEquals(new BigDecimal("3.50"), credit.getAcrescimoValor());
        assertEquals(new BigDecimal("73.50"), credit.getValorPago());
    }

}
