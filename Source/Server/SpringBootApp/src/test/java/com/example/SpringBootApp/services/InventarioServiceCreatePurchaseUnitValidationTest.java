package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraItemDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventarioServiceCreatePurchaseUnitValidationTest {

    @Mock
    private CompraRepository compraRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private DecarteRepository decarteRepository;

    @InjectMocks
    private com.example.SpringBootApp.services.InventarioService inventarioService;

    @Test
    void createPurchase_ShouldThrow_WhenProductUnitIsUNAndQuantityNotInteger() {
        Long productId = 10L;
        CompraItemDTO item = new CompraItemDTO(productId, new BigDecimal("1.5000"), new BigDecimal("5.00"), null);
        CompraCreateDTO dto = new CompraCreateDTO(LocalDate.now(), List.of(item));

        Produto p = new Produto();
        p.setId(productId);
        p.setUnidadeMedida(UnitMeasurement.UN);
        p.setPerecivel(false);

        when(produtoRepository.findById(productId)).thenReturn(Optional.of(p));

        assertThrows(BusinessException.class, () -> inventarioService.createPurchase(dto));
    }
}
