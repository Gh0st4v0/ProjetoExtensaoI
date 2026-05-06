package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraItemDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.CompraRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.DecarteRepository;
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
class InventarioServiceTest {

    @Mock
    private CompraRepository compraRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private DecarteRepository decarteRepository;

    @InjectMocks
    private InventarioService inventarioService;

    @Test
    void createCompra_ShouldReturnCompra_WhenValidInput() {
        // Arrange
        CompraItemDTO item1 = new CompraItemDTO(1L, new BigDecimal("10.5"), new BigDecimal("45.90"), LocalDate.of(2024, 2, 15));
        CompraItemDTO item2 = new CompraItemDTO(2L, new BigDecimal("5.0"), new BigDecimal("32.50"), LocalDate.of(2024, 3, 1));
        CompraCreateDTO compraDTO = new CompraCreateDTO(LocalDate.of(2024, 1, 15), List.of(item1, item2));

        Produto produto1 = new Produto();
        produto1.setId(1L);
        produto1.setNome("Picanha");
        produto1.setUnidadeMedida(UnitMeasurement.KG);
        produto1.setCodigo("000001");
        produto1.setPerecivel(true);
        
        Produto produto2 = new Produto();
        produto2.setId(2L);
        produto2.setNome("Alcatra");
        produto2.setUnidadeMedida(UnitMeasurement.KG);
        produto2.setCodigo("000002");
        produto2.setPerecivel(true);

        Compra savedCompra = new Compra();
        savedCompra.setId(1L);
        savedCompra.setDataCompra(LocalDate.of(2024, 1, 15));
        
        Movimentacao savedItem1 = new Movimentacao();
        savedItem1.setId(1L);
        savedItem1.setQuantidade(new BigDecimal("10.5"));
        savedItem1.setPrecoUnitarioCompra(new BigDecimal("45.90"));
        savedItem1.setPrecoUnitarioVenda(null);
        savedItem1.setDataValidade(LocalDate.of(2024, 2, 15));
        savedItem1.setProduto(produto1);
        savedItem1.setCompra(savedCompra);
        savedItem1.setTipoMovimentacao(MovementType.COMPRA);
        
        Movimentacao savedItem2 = new Movimentacao();
        savedItem2.setId(2L);
        savedItem2.setQuantidade(new BigDecimal("5.0"));
        savedItem2.setPrecoUnitarioCompra(new BigDecimal("32.50"));
        savedItem2.setPrecoUnitarioVenda(null);
        savedItem2.setDataValidade(LocalDate.of(2024, 3, 1));
        savedItem2.setProduto(produto2);
        savedItem2.setCompra(savedCompra);
        savedItem2.setTipoMovimentacao(MovementType.COMPRA);

        when(compraRepository.save(any(Compra.class))).thenReturn(savedCompra);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto1));
        when(produtoRepository.findById(2L)).thenReturn(Optional.of(produto2));
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenReturn(savedItem1, savedItem2);

        // Act
        Compra result = inventarioService.createPurchase(compraDTO);

        // Assert
        assertNotNull(result);
        assertEquals(LocalDate.of(2024, 1, 15), result.getDataCompra());
        assertEquals(1L, result.getId());

        verify(compraRepository).save(any(Compra.class));
        verify(produtoRepository, times(2)).findById(1L);
        verify(produtoRepository, times(2)).findById(2L);
        verify(movimentacaoRepository, times(2)).save(any(Movimentacao.class));
    }

    @Test
    void createCompra_ShouldUseCurrentDate_WhenDateIsNull() {
        // Arrange
        CompraItemDTO item = new CompraItemDTO(1L, new BigDecimal("10.5"), new BigDecimal("45.90"), null);
        CompraCreateDTO compraDTO = new CompraCreateDTO(null, List.of(item));

        Produto produto = new Produto();
        produto.setId(1L);
        produto.setNome("Picanha");
        produto.setUnidadeMedida(UnitMeasurement.KG);
        produto.setCodigo("000001");
        produto.setPerecivel(false);
        
        Compra savedCompra = new Compra();
        savedCompra.setId(1L);
        savedCompra.setDataCompra(LocalDate.now());
        
        Movimentacao savedItem = new Movimentacao();
        savedItem.setId(1L);
        savedItem.setQuantidade(new BigDecimal("10.5"));
        savedItem.setPrecoUnitarioCompra(new BigDecimal("45.90"));
        savedItem.setPrecoUnitarioVenda(null);
        savedItem.setProduto(produto);
        savedItem.setCompra(savedCompra);
        savedItem.setTipoMovimentacao(MovementType.COMPRA);

        when(compraRepository.save(any(Compra.class))).thenReturn(savedCompra);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenReturn(savedItem);

        // Act
        Compra result = inventarioService.createPurchase(compraDTO);

        // Assert
        assertNotNull(result);
        assertEquals(LocalDate.now(), result.getDataCompra());
    }

    @Test
    void createCompra_ShouldThrowException_WhenProdutoNotFound() {
        // Arrange
        CompraItemDTO item = new CompraItemDTO(999L, new BigDecimal("10.5"), new BigDecimal("45.90"), null);
        CompraCreateDTO compraDTO = new CompraCreateDTO(LocalDate.now(), List.of(item));

        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> inventarioService.createPurchase(compraDTO));

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(produtoRepository).findById(999L);
        verify(compraRepository, never()).save(any());
        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    void createCompra_ShouldCreateMovimentacoesWithCorrectData() {
        // Arrange
        LocalDate expiringDate = LocalDate.of(2024, 2, 15);
        CompraItemDTO itemDTO = new CompraItemDTO(1L, new BigDecimal("10.5"), new BigDecimal("45.90"), expiringDate);
        CompraCreateDTO compraDTO = new CompraCreateDTO(LocalDate.now(), List.of(itemDTO));

        Produto produto = new Produto();
        produto.setId(1L);
        produto.setNome("Picanha");
        produto.setUnidadeMedida(UnitMeasurement.KG);
        produto.setCodigo("000001");
        produto.setPerecivel(true);
        
        Compra savedCompra = new Compra();
        savedCompra.setId(1L);
        savedCompra.setDataCompra(LocalDate.now());

        when(compraRepository.save(any(Compra.class))).thenReturn(savedCompra);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(invocation -> {
            Movimentacao movimentacao = invocation.getArgument(0);
            assertEquals(new BigDecimal("10.5"), movimentacao.getQuantidade());
            assertEquals(new BigDecimal("45.90"), movimentacao.getPrecoUnitarioCompra());
            assertNull(movimentacao.getPrecoUnitarioVenda());
            assertEquals(expiringDate, movimentacao.getDataValidade());
            assertEquals(produto, movimentacao.getProduto());
            assertEquals(savedCompra, movimentacao.getCompra());
            assertNull(movimentacao.getVenda());
            assertEquals(MovementType.COMPRA, movimentacao.getTipoMovimentacao());
            
            Movimentacao returnItem = new Movimentacao();
            returnItem.setId(1L);
            returnItem.setQuantidade(movimentacao.getQuantidade());
            returnItem.setPrecoUnitarioCompra(movimentacao.getPrecoUnitarioCompra());
            returnItem.setPrecoUnitarioVenda(movimentacao.getPrecoUnitarioVenda());
            returnItem.setDataValidade(movimentacao.getDataValidade());
            returnItem.setProduto(movimentacao.getProduto());
            returnItem.setCompra(movimentacao.getCompra());
            returnItem.setTipoMovimentacao(movimentacao.getTipoMovimentacao());
            return returnItem;
        });

        // Act
        Compra result = inventarioService.createPurchase(compraDTO);

        // Assert
        assertNotNull(result);
        verify(movimentacaoRepository).save(any(Movimentacao.class));
    }

    @Test
    void updatePurchaseItem_ShouldUpdate_WhenStockOk() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(10L);
        purchaseMov.setQuantidade(new BigDecimal("10"));
        purchaseMov.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("10"));
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Movimentacao result = inventarioService.updatePurchaseItem(1L, 1L, new BigDecimal("5"), null, null);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("5"), result.getQuantidade());
        verify(movimentacaoRepository).save(any(Movimentacao.class));
    }

    @Test
    void updatePurchaseItem_ShouldThrow_WhenGlobalStockNegative() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(11L);
        purchaseMov.setQuantidade(new BigDecimal("5"));
        purchaseMov.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("3"));

        // Act & Assert
        assertThrows(BusinessException.class, () -> inventarioService.updatePurchaseItem(1L, 1L, new BigDecimal("1"), null, null));
    }

    @Test
    void updatePurchaseItem_ShouldThrow_WhenLotSalesExceedNewQuantity() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(12L);
        purchaseMov.setQuantidade(new BigDecimal("10"));
        purchaseMov.setProduto(produto);

        Movimentacao saleMov = new Movimentacao();
        saleMov.setId(13L);
        saleMov.setQuantidade(new BigDecimal("-8"));
        saleMov.setVenda(new Venda());
        saleMov.setProduto(produto);

        lenient().when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        lenient().when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov, saleMov));
        lenient().when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("2"));

        // Act & Assert
        assertThrows(BusinessException.class, () -> inventarioService.updatePurchaseItem(1L, 1L, new BigDecimal("5"), null, null));
    }
    @Test
    void updatePurchaseItem_ShouldThrow_WhenExpiryBeforeSaleDate() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);
        produto.setPerecivel(true);
        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(12L);
        purchaseMov.setQuantidade(new BigDecimal("10"));
        purchaseMov.setProduto(produto);
        Venda venda = new Venda();
        venda.setId(1L);
        venda.setDataVenda(LocalDate.of(2024, 2, 10));
        Movimentacao saleMov = new Movimentacao();
        saleMov.setId(13L);
        saleMov.setQuantidade(new BigDecimal("-2"));
        saleMov.setVenda(venda);
        saleMov.setProduto(produto);
        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov, saleMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("8"));
        // Act & Assert
        assertThrows(BusinessException.class, () -> inventarioService.updatePurchaseItem(1L, 1L, new BigDecimal("10"), null, LocalDate.of(2024, 2, 1)));
    }

    @Test
    void createDiscard_ShouldCreateDescarte_WhenStockOk() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);

        Compra compra = new Compra();
        compra.setId(1L);

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(20L);
        purchaseMov.setQuantidade(new BigDecimal("10"));
        purchaseMov.setProduto(produto);
        purchaseMov.setCompra(compra);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("10"));
        when(decarteRepository.save(any(Descarte.class))).thenAnswer(invocation -> {
            Descarte d = invocation.getArgument(0);
            d.setId(100L);
            return d;
        });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(invocation -> {
            Movimentacao m = invocation.getArgument(0);
            m.setId(200L);
            return m;
        });

        com.example.SpringBootApp.DTOs.DescarteItemDTO item = new com.example.SpringBootApp.DTOs.DescarteItemDTO(1L, 1L, new BigDecimal("2"));
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dto = new com.example.SpringBootApp.DTOs.DescarteCreateDTO(null, DescarteType.PERDA_PESO, List.of(item));

        // Act
        Descarte result = inventarioService.createDiscard(dto);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(decarteRepository).save(any(Descarte.class));
        verify(movimentacaoRepository, times(1)).save(any(Movimentacao.class));
    }

    @Test
    void createDiscard_ShouldThrow_WhenGlobalStockNegative() {
        // Arrange
        Produto produto = new Produto();
        produto.setId(1L);

        Compra compra = new Compra();
        compra.setId(1L);

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setId(21L);
        purchaseMov.setQuantidade(new BigDecimal("5"));
        purchaseMov.setProduto(produto);
        purchaseMov.setCompra(compra);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(1L, 1L)).thenReturn(List.of(purchaseMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(1L)).thenReturn(new BigDecimal("1"));

        com.example.SpringBootApp.DTOs.DescarteItemDTO item = new com.example.SpringBootApp.DTOs.DescarteItemDTO(1L, 1L, new BigDecimal("2"));
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dto = new com.example.SpringBootApp.DTOs.DescarteCreateDTO(null, DescarteType.PERDA_PESO, List.of(item));

        // Act & Assert
        assertThrows(BusinessException.class, () -> inventarioService.createDiscard(dto));
    }

    @Test
    void createDiscard_ShouldThrow_WhenPurchaseItemNotFound() {
        // Arrange
        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(1L, 1L)).thenReturn(null);

        com.example.SpringBootApp.DTOs.DescarteItemDTO item = new com.example.SpringBootApp.DTOs.DescarteItemDTO(1L, 1L, new BigDecimal("1"));
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dto = new com.example.SpringBootApp.DTOs.DescarteCreateDTO(null, DescarteType.DANO, List.of(item));

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> inventarioService.createDiscard(dto));
    }
}






