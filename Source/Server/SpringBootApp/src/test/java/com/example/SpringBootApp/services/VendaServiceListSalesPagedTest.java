package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceListSalesPagedTest {

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
    void listSalesPaged_returnsPageOfDto() {
        Venda venda = new Venda();
        venda.setId(1L);
        venda.setDataVenda(LocalDate.now());
        venda.setValorTotal(new BigDecimal("100.00"));
        Usuario u = new Usuario(); u.setId(1L); u.setNome("User"); venda.setUsuario(u);
        venda.setItens(List.of());

        Page<Venda> page = new PageImpl<>(List.of(venda));
        when(vendaRepository.findAll(any(Pageable.class))).thenReturn(page);

        org.springframework.data.domain.Page<VendaResponseDTO> result = vendaService.listSales(0, 10);
        assertEquals(1, result.getTotalElements());
        VendaResponseDTO dto = result.getContent().get(0);
        assertEquals(1L, dto.getId().longValue());
        assertEquals("User", dto.getUsuarioNome());
    }
}
