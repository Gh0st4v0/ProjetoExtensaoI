package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.models.Venda;
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

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceGetByIdTest {

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

    @InjectMocks
    private com.example.SpringBootApp.services.VendaService vendaService;

    @Test
    void getSaleById_returnsDto() {
        Venda venda = new Venda();
        venda.setId(1L);
        venda.setDataVenda(LocalDate.now());
        Usuario u = new Usuario(); u.setId(1L); u.setNome("User"); venda.setUsuario(u);

        Movimentacao m = new Movimentacao();
        m.setQuantidade(new BigDecimal("-2"));
        Produto p = new Produto(); p.setId(5L); p.setNome("Prod");
        m.setProduto(p);
        m.setPrecoUnitarioVenda(new BigDecimal("10.00"));
        m.setPrecoUnitarioCompra(new BigDecimal("8.00"));

        venda.setItens(List.of(m));

        when(vendaRepository.findById(1L)).thenReturn(Optional.of(venda));

        VendaResponseDTO dto = vendaService.getSaleById(1L);
        assertNotNull(dto);
        assertEquals(1L, dto.getId().longValue());
        assertEquals(1, dto.getItems().size());
        assertEquals(0, dto.getItems().get(0).getQuantity().compareTo(new BigDecimal("2")));
        assertEquals("Prod", dto.getItems().get(0).getProductName());
    }
}
