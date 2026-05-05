package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
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
class VendaServiceAutoDiscardTest {

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
    void createSale_ShouldAutoDiscardSmallRemainderForKGProducts() {
        Long userId = 1L;
        Long productId = 10L;
        Long purchaseId = 100L;
        BigDecimal quantity = new BigDecimal("9.9860");

        Usuario usuario = new Usuario(); usuario.setId(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));

        Produto produto = new Produto(); produto.setId(productId); produto.setUnidadeMedida(UnitMeasurement.KG);
        when(produtoRepository.findById(productId)).thenReturn(Optional.of(produto));

        Compra compra = new Compra(); compra.setId(purchaseId);
        when(compraRepository.findById(purchaseId)).thenReturn(Optional.of(compra));

        when(movimentacaoRepository.sumQuantityByProdutoId(productId)).thenReturn(new BigDecimal("10.0000"));

        Movimentacao stockItem = new Movimentacao();
        stockItem.setId(200L);
        stockItem.setQuantidade(new BigDecimal("10.0000"));
        stockItem.setPrecoUnitarioCompra(new BigDecimal("50.00"));
        stockItem.setPrecoUnitarioVenda(new BigDecimal("80.00"));
        stockItem.setCompra(compra);
        stockItem.setProduto(produto);

        when(movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)).thenReturn(stockItem);

        VendItemDTO item = new VendItemDTO(purchaseId, productId, quantity, null);
        VendCreateDTO saleDTO = new VendCreateDTO(LocalDate.now(), PaymentMethod.PIX, false, userId, null, List.of(item));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(i -> { Venda v = i.getArgument(0); v.setId(1L); return v; });
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(i -> i.getArgument(0));

        BigDecimal leftover = new BigDecimal("0.0140");
        when(movimentacaoRepository.sumQuantityByPurchaseId(purchaseId)).thenReturn(leftover);

        Descarte descarte = new Descarte();
        when(inventarioService.createDiscard(any(com.example.SpringBootApp.DTOs.DescarteCreateDTO.class))).thenReturn(descarte);

        Venda saved = vendaService.createSale(saleDTO);

        ArgumentCaptor<com.example.SpringBootApp.DTOs.DescarteCreateDTO> captor = ArgumentCaptor.forClass(com.example.SpringBootApp.DTOs.DescarteCreateDTO.class);
        verify(inventarioService).createDiscard(captor.capture());
        com.example.SpringBootApp.DTOs.DescarteCreateDTO dtoArg = captor.getValue();
        assertEquals(com.example.SpringBootApp.models.DescarteType.PERDA_PESO, dtoArg.getType());
        assertEquals(1, dtoArg.getItems().size());
        assertEquals(0, dtoArg.getItems().get(0).getQuantity().compareTo(leftover));
    }
}
