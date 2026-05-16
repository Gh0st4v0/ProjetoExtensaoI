package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class VendaServiceExtraTest {

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
    private InventarioService inventarioService;

    @InjectMocks
    private VendaService vendaService;

    @Test
    void createSale_appliesDiscount_whenHasDiscountTrue() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        BigDecimal quantity = new BigDecimal("2.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId); compra.setDataCompra(LocalDate.now());
        when(compraRepository.findAll()).thenReturn(List.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("10.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("5.00"));
        stockItem.setPrecoUnitarioVenda(new BigDecimal("10.00"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stockItem));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(stockItem.getQuantidade());

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, true, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(10L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        // computed total = 10.00 * 2 = 20.00 -> with discount 0.95 => 19.00
        assertNotNull(saved.getValorTotal());
        assertEquals(0, saved.getValorTotal().compareTo(new BigDecimal("19.00")));
    }

    @Test
    void createSale_usesProdutoPrecoVenda_whenStockVendaAndItemPriceNull() {
        Long userId = 2L;
        Long productId = 11L;
        Long purchaseId = 101L;
        BigDecimal quantity = new BigDecimal("1.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setPrecoVenda(new BigDecimal("7.50"));
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId); compra.setDataCompra(LocalDate.now());
        when(compraRepository.findAll()).thenReturn(List.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("5.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(210L);
        stockItem.setQuantidade(new BigDecimal("5.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("3.00"));
        stockItem.setPrecoUnitarioVenda(null); // no price on stock
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stockItem));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(stockItem.getQuantidade());

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(11L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        Movimentacao savedMov = saved.getItens().get(0);
        assertEquals(new BigDecimal("7.50"), savedMov.getPrecoUnitarioVenda());
    }

    @Test
    void createSale_usesZeroPrice_whenNoPricesAvailable() {
        Long userId = 3L;
        Long productId = 12L;
        Long purchaseId = 102L;
        BigDecimal quantity = new BigDecimal("1.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setPrecoVenda(null);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId); compra.setDataCompra(LocalDate.now());
        when(compraRepository.findAll()).thenReturn(List.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("5.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(220L);
        stockItem.setQuantidade(new BigDecimal("5.0000"));
        stockItem.setPrecoUnitarioCompra(null);
        stockItem.setPrecoUnitarioVenda(null);
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stockItem));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(stockItem.getQuantidade());

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(12L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        Venda saved = vendaService.createSale(saleDTO);

        Movimentacao savedMov = saved.getItens().get(0);
        assertEquals(BigDecimal.ZERO, savedMov.getPrecoUnitarioVenda());
    }

    @Test
    void createSale_throws_whenUsuarioMissing() {
        Long userId = 99L;
        VendItemDTO item = new VendItemDTO(null, 1L, new BigDecimal("1"), null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        when(usuarioRepository.findById(userId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> vendaService.createSale(saleDTO));
        assertEquals("Usuario not found", ex.getMessage());
    }

    @Test
    void createSale_throws_whenProdutoMissing() {
        Long userId = 1L;
        Long productId = 999L;

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        VendItemDTO item = new VendItemDTO(null, productId, new BigDecimal("1"), null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        when(produtoRepository.findById(productId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> vendaService.createSale(saleDTO));
        assertEquals("Produto not found with id: " + productId, ex.getMessage());
    }
}
