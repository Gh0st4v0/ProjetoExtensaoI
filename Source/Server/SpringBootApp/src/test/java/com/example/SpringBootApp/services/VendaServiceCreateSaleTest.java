package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
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
class VendaServiceCreateSaleTest {

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

    @InjectMocks
    private VendaService vendaService;

    @Test
    void createSale_ShouldCreateMovimentacao_WhenSufficientStockSingleLot() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        BigDecimal quantity = new BigDecimal("2.0000");

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto();
        produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra();
        compra.setId(purchaseId);
        when(compraRepository.findById(purchaseId)).thenReturn(Optional.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("10.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("5.00"));
        stockItem.setPrecoUnitarioVenda(new BigDecimal("8.00"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)).thenReturn(stockItem);

        VendItemDTO item = new VendItemDTO(purchaseId, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> {
            Venda v = i.getArgument(0);
            v.setId(1L);
            return v;
        });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        verify(vendaRepository).save(any(Venda.class));
        verify(movimentacaoRepository, times(1)).save(any(Movimentacao.class));
        assertEquals(1L, saved.getId());
        assertNotNull(saved.getItens());
        assertEquals(1, saved.getItens().size());
        Movimentacao savedMov = saved.getItens().get(0);
        assertEquals(new BigDecimal("-2.0000"), savedMov.getQuantidade());
        assertEquals(stockItem.getPrecoUnitarioCompra(), savedMov.getPrecoUnitarioCompra());
        assertEquals(stockItem.getPrecoUnitarioVenda(), savedMov.getPrecoUnitarioVenda());
    }

    @Test
    void createSale_ShouldSplitAcrossLots_WhenSingleLotInsufficient() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseA = 100L;
        Long purchaseB = 101L;
        BigDecimal quantity = new BigDecimal("2.5000");

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto();
        produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compraA = new Compra(); compraA.setId(purchaseA); compraA.setDataCompra(LocalDate.now().minusDays(10));
        Compra compraB = new Compra(); compraB.setId(purchaseB); compraB.setDataCompra(LocalDate.now().minusDays(1));
        when(compraRepository.findAll()).thenReturn(List.of(compraA, compraB));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("3.0000"));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseA)).thenReturn(new BigDecimal("1.5000"));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseB)).thenReturn(new BigDecimal("1.5000"));

        Movimentacao stockA = new Movimentacao(); stockA.setId(200L); stockA.setQuantidade(new BigDecimal("1.5000")); stockA.setCompra(compraA); stockA.setProduto(produto);
        Movimentacao stockB = new Movimentacao(); stockB.setId(201L); stockB.setQuantidade(new BigDecimal("1.5000")); stockB.setCompra(compraB); stockB.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseA, productId)).thenReturn(List.of(stockA));
        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseB, productId)).thenReturn(List.of(stockB));

        // no direct findFirst stub for this flow; service should iterate purchases

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(2L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        // two movimentacoes saved (one per lote)
        verify(movimentacaoRepository, atLeast(2)).save(any(Movimentacao.class));
        assertEquals(2L, saved.getId());
        assertNotNull(saved.getItens());
        assertTrue(saved.getItens().size() >= 2);
    }

    @Test
    void createSale_ShouldThrow_WhenInsufficientStock() {
        Long userId = 1L;
        Long productId = 10L;
        BigDecimal quantity = new BigDecimal("5.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("2.0000"));

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        assertThrows(BusinessException.class, () -> vendaService.createSale(saleDTO));
    }

    @Test
    void createSale_ShouldUseProvidedPrecoUnitarioVenda_WhenGiven() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        BigDecimal quantity = new BigDecimal("2.0000");

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto();
        produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra();
        compra.setId(purchaseId);
        when(compraRepository.findById(purchaseId)).thenReturn(Optional.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("10.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("5.00"));
        stockItem.setPrecoUnitarioVenda(new BigDecimal("8.00"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)).thenReturn(stockItem);

        BigDecimal overridePrice = new BigDecimal("12.75");
        VendItemDTO item = new VendItemDTO(purchaseId, productId, quantity, overridePrice);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(3L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        verify(movimentacaoRepository).save(any(Movimentacao.class));
        Movimentacao savedMov = saved.getItens().get(0);
        assertEquals(overridePrice, savedMov.getPrecoUnitarioVenda());
    }

    @Test
    void createSale_ShouldLinkCliente_WhenClienteIdProvided() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        Long clienteId = 55L;
        BigDecimal quantity = new BigDecimal("1.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId);
        when(compraRepository.findById(purchaseId)).thenReturn(Optional.of(compra));

        Cliente cliente = new Cliente(); cliente.setId(clienteId);
        when(clienteRepository.findById(clienteId)).thenReturn(Optional.of(cliente));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao(); stockItem.setId(200L); stockItem.setQuantidade(new BigDecimal("10.0000")); stockItem.setCompra(compra); stockItem.setProduto(produto);
        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)).thenReturn(stockItem);

        VendItemDTO item = new VendItemDTO(purchaseId, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, clienteId, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(99L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        assertNotNull(saved.getCliente());
        assertEquals(clienteId, saved.getCliente().getId());
    }
}
