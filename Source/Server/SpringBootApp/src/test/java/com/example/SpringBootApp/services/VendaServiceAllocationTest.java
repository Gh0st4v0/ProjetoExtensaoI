package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.DescarteCreateDTO;
import com.example.SpringBootApp.DTOs.DescarteItemDTO;
import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
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
class VendaServiceAllocationTest {

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
    void createSale_splitsAllocationAcrossMultiplePurchases() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId1 = 100L;
        Long purchaseId2 = 101L;
        BigDecimal quantity = new BigDecimal("3.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setPrecoVenda(null); produto.setUnidadeMedida(UnitMeasurement.KG);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra c1 = new Compra(); c1.setId(purchaseId1); c1.setDataCompra(LocalDate.of(2020,1,1));
        Compra c2 = new Compra(); c2.setId(purchaseId2); c2.setDataCompra(LocalDate.of(2020,2,1));
        when(compraRepository.findAll()).thenReturn(List.of(c1, c2));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("4.0000"));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId1)).thenReturn(new BigDecimal("2.0000"), new BigDecimal("0.0000"));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId2)).thenReturn(new BigDecimal("2.0000"), new BigDecimal("1.0000"));

        Movimentacao stock1 = new Movimentacao(); stock1.setId(200L); stock1.setQuantidade(new BigDecimal("2.0000")); stock1.setPrecoUnitarioVenda(new BigDecimal("10.00")); stock1.setPrecoUnitarioCompra(new BigDecimal("5.00")); stock1.setCompra(c1); stock1.setProduto(produto);
        Movimentacao stock2 = new Movimentacao(); stock2.setId(201L); stock2.setQuantidade(new BigDecimal("2.0000")); stock2.setPrecoUnitarioVenda(new BigDecimal("12.00")); stock2.setPrecoUnitarioCompra(new BigDecimal("6.00")); stock2.setCompra(c2); stock2.setProduto(produto);

        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId1, productId)).thenReturn(List.of(stock1));
        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId2, productId)).thenReturn(List.of(stock2));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(1000L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        Venda saved = vendaService.createSale(saleDTO);

        assertEquals(2, saved.getItens().size());
        BigDecimal expectedTotal = new BigDecimal("32.00"); // 2*10 + 1*12
        assertEquals(0, saved.getValorTotal().compareTo(expectedTotal));
        assertEquals(0, saved.getItens().get(0).getQuantidade().compareTo(new BigDecimal("-2.0000")));
        assertEquals(0, saved.getItens().get(1).getQuantidade().compareTo(new BigDecimal("-1.0000")));
    }

    @Test
    void createSale_triggersAutoDiscard_whenLeftoverBelowThreshold() {
        Long userId = 2L;
        Long productId = 11L;
        Long purchaseId = 102L;
        BigDecimal quantity = new BigDecimal("0.95");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setUnidadeMedida(UnitMeasurement.KG);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra c1 = new Compra(); c1.setId(purchaseId); c1.setDataCompra(LocalDate.now());
        when(compraRepository.findAll()).thenReturn(List.of(c1));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("1.0000"));
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(new BigDecimal("1.0000"), new BigDecimal("0.0500"));

        Movimentacao stock = new Movimentacao(); stock.setId(300L); stock.setQuantidade(new BigDecimal("1.0000")); stock.setPrecoUnitarioVenda(new BigDecimal("20.00")); stock.setPrecoUnitarioCompra(new BigDecimal("10.00")); stock.setCompra(c1); stock.setProduto(produto);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stock));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(2000L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        Venda saved = vendaService.createSale(saleDTO);

        // Inventory discard should have been triggered once for the purchase
        verify(inventarioService, times(1)).createDiscard(any(DescarteCreateDTO.class));
        assertEquals(0, saved.getValorTotal().compareTo(new BigDecimal("19.00")));// 20.00 * 0.95? Actually quantity 0.95 * 20 = 19.00
    }

    @Test
    void createSale_throws_whenUNQuantityNotInteger() {
        Long userId = 3L;
        Long productId = 13L;
        BigDecimal quantity = new BigDecimal("1.5");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setUnidadeMedida(UnitMeasurement.UN);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        BusinessException ex = assertThrows(BusinessException.class, () -> vendaService.createSale(saleDTO));
        assertTrue(ex.getMessage().contains("Quantidade deve ser inteira"));
    }

    @Test
    void createSale_throws_whenTotalInsufficient() {
        Long userId = 4L;
        Long productId = 14L;
        BigDecimal quantity = new BigDecimal("2.0000");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setUnidadeMedida(UnitMeasurement.KG);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(BigDecimal.ZERO);

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.DINHEIRO, false, userId, null, List.of(item));

        BusinessException ex = assertThrows(BusinessException.class, () -> vendaService.createSale(saleDTO));
        assertTrue(ex.getMessage().contains("Quantidade insuficiente em estoque"));
    }
}
