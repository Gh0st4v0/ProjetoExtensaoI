package com.example.SpringBootApp.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.SpringBootApp.models.PaymentMethod;
import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.DTOs.VendaPaymentDTO;
import com.example.SpringBootApp.models.Compra;
import com.example.SpringBootApp.models.Configuracao;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.models.VendaPagamento;
import com.example.SpringBootApp.repositories.CompraRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import com.example.SpringBootApp.repositories.VendaPagamentoRepository;
import com.example.SpringBootApp.repositories.VendaRepository;

@ExtendWith(MockitoExtension.class)
class VendaServiceTest {

    @Mock private VendaRepository vendaRepository;
    @Mock private VendaPagamentoRepository vendaPagamentoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ProdutoRepository produtoRepository;
    @Mock private CompraRepository compraRepository;
    @Mock private MovimentacaoRepository movimentacaoRepository;
    @Mock private ConfiguracaoService configuracaoService;

    @InjectMocks
    private VendaService vendaService;

    @Test
    void deveManterAcrescimoMesmoComDiferencaDeArredondamentoEntreFrontEBack() {
        // 1. Construção do Payload exato fornecido
        VendItemDTO item = new VendItemDTO();
        item.setProductId(4L);
        item.setQuantity(new BigDecimal("2.185"));
        item.setPrecoUnitarioVenda(new BigDecimal("55.00")); // Valor matemático = 120.175

        VendaPaymentDTO payment = new VendaPaymentDTO();
        payment.setPaymentMethod(PaymentMethod.CREDITO);
        payment.setValor(new BigDecimal("120.17")); // Front-end truncou para 120.17
        payment.setAcrescimoPercent(new BigDecimal("5.00"));
        payment.setAcrescimoValor(new BigDecimal("6.01"));
        payment.setValorPago(new BigDecimal("126.18"));

        VendCreateDTO payload = new VendCreateDTO();
        payload.setUserId(1L);
        payload.setPaymentMethod(PaymentMethod.CREDITO);
        payload.setPayments(List.of(payment));
        payload.setHasDiscount(false);
        payload.setItems(List.of(item));

        // 2. Mocks de Banco de Dados
        Usuario user = new Usuario();
        user.setId(1L);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(user));

        Produto produto = new Produto();
        produto.setId(4L);
        produto.setUnidadeMedida(UnitMeasurement.KG);
        when(produtoRepository.findById(4L)).thenReturn(Optional.of(produto));

        Compra compra = new Compra();
        compra.setId(10L);
        when(compraRepository.findComprasWithStockForProduct(4L)).thenReturn(List.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(4L)).thenReturn(new BigDecimal("10.000"));
        when(movimentacaoRepository.sumQuantityByPurchaseAndProduct(10L, 4L)).thenReturn(new BigDecimal("10.000"));

        Venda savedVenda = new Venda();
        savedVenda.setId(99L);
        savedVenda.setDataVenda(LocalDateTime.now());
        when(vendaRepository.save(any(Venda.class))).thenReturn(savedVenda);

        // 🚨 Ponto de atenção para o seu Debug: A configuração!
        Configuracao config = new Configuracao();
        config.setAcrescimoCredito(new BigDecimal("5.00"));
        when(configuracaoService.getConfiguracaoForDate(any())).thenReturn(config);

        // 3. Execução
        vendaService.createSale(payload);

        // 4. Verificação e Asserções
        ArgumentCaptor<VendaPagamento> pgtoCaptor = ArgumentCaptor.forClass(VendaPagamento.class);
        verify(vendaPagamentoRepository).save(pgtoCaptor.capture());

        VendaPagamento vpSalvo = pgtoCaptor.getValue();

        // O valor base sobe para 120.18 devido à matemática do back-end,
        // mas o acréscimo não deve zerar. Ele deve recalcular os 5% em cima de 120.18 (~6.01).
        assertEquals(new BigDecimal("120.18"), vpSalvo.getValor());
        assertEquals(new BigDecimal("6.01"), vpSalvo.getAcrescimoValor(), "O acréscimo não deveria estar zerado!");
        assertEquals(new BigDecimal("126.19"), vpSalvo.getValorPago());
    }
}