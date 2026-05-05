package com.example.SpringBootApp.services;

import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventarioServiceUpdatePurchaseItemUnitValidationTest {

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @InjectMocks
    private com.example.SpringBootApp.services.InventarioService inventarioService;

    @Test
    void updatePurchaseItem_ShouldThrow_WhenProductUnitIsUNAndQuantityNotInteger() {
        Long purchaseId = 100L;
        Long productId = 10L;

        Movimentacao purchaseMov = new Movimentacao();
        purchaseMov.setQuantidade(new BigDecimal("2.0000"));
        Produto produto = new Produto();
        produto.setId(productId);
        produto.setUnidadeMedida(UnitMeasurement.UN);
        purchaseMov.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)).thenReturn(purchaseMov);
        when(movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId)).thenReturn(List.of(purchaseMov));
        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("5.0000"));

        BigDecimal newQuantity = new BigDecimal("1.2500");

        assertThrows(BusinessException.class, () -> inventarioService.updatePurchaseItem(purchaseId, productId, newQuantity, null, null));
    }
}
