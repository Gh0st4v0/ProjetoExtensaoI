package com.example.SpringBootApp.services;

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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendaServiceUnitMeasurementValidationTest {

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
    private com.example.SpringBootApp.services.InventarioService inventarioService;

    @InjectMocks
    private VendaService vendaService;

    @Test
    void createSale_ShouldThrow_WhenProductUnitIsUNAndQuantityNotInteger() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        BigDecimal quantity = new BigDecimal("1.5000");

        Usuario usuario = new Usuario();
        usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto();
        produto.setId(productId);
        produto.setUnidadeMedida(UnitMeasurement.UN);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra();
        compra.setId(purchaseId);
        org.mockito.Mockito.lenient().when(compraRepository.findAll()).thenReturn(List.of(compra));

        org.mockito.Mockito.lenient().when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("10.0000"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        org.mockito.Mockito.lenient().when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(stockItem));

        VendItemDTO item = new VendItemDTO(null, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        assertThrows(BusinessException.class, () -> vendaService.createSale(saleDTO));
    }
}
