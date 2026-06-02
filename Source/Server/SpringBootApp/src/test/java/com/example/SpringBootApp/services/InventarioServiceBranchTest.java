package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraItemDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.repositories.CompraRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.DecarteRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class InventarioServiceBranchTest {

    @Test
    public void createPurchase_productNotFound_throws() {
        CompraCreateDTO dto = new CompraCreateDTO();
        CompraItemDTO item = new CompraItemDTO();
        item.setProductId(1L);
        dto.setItems(Collections.singletonList(item));

        CompraRepository cr = mock(CompraRepository.class);
        MovimentacaoRepository mr = mock(MovimentacaoRepository.class);
        ProdutoRepository pr = mock(ProdutoRepository.class);
        DecarteRepository dr = mock(DecarteRepository.class);

        when(pr.findById(1L)).thenReturn(Optional.empty());

        com.example.SpringBootApp.repositories.VendaRepository vr = mock(com.example.SpringBootApp.repositories.VendaRepository.class);
        com.example.SpringBootApp.services.ConfiguracaoService cs = mock(com.example.SpringBootApp.services.ConfiguracaoService.class);
        InventarioService svc = new InventarioService(cr, mr, pr, dr, vr, cs);

        assertThrows(ResourceNotFoundException.class, () -> svc.createPurchase(dto));
    }

    @Test
    public void createPurchase_perishableWithoutDate_throws() {
        CompraCreateDTO dto = new CompraCreateDTO();
        CompraItemDTO item = new CompraItemDTO();
        item.setProductId(2L);
        item.setQuantity(new BigDecimal("2"));
        // no expiring date
        dto.setItems(Collections.singletonList(item));

        CompraRepository cr = mock(CompraRepository.class);
        MovimentacaoRepository mr = mock(MovimentacaoRepository.class);
        ProdutoRepository pr = mock(ProdutoRepository.class);
        DecarteRepository dr = mock(DecarteRepository.class);

        Produto p = new Produto();
        p.setId(2L);
        p.setPerecivel(Boolean.TRUE);
        p.setUnidadeMedida(UnitMeasurement.KG);

        when(pr.findById(2L)).thenReturn(Optional.of(p));

        com.example.SpringBootApp.repositories.VendaRepository vr = mock(com.example.SpringBootApp.repositories.VendaRepository.class);
        com.example.SpringBootApp.services.ConfiguracaoService cs = mock(com.example.SpringBootApp.services.ConfiguracaoService.class);
        InventarioService svc = new InventarioService(cr, mr, pr, dr, vr, cs);

        assertThrows(BusinessException.class, () -> svc.createPurchase(dto));
    }

    @Test
    public void createPurchase_nonPerishableWithDate_throws() {
        CompraCreateDTO dto = new CompraCreateDTO();
        CompraItemDTO item = new CompraItemDTO();
        item.setProductId(3L);
        item.setQuantity(new BigDecimal("2"));
        item.setExpiringDate(LocalDate.now());
        dto.setItems(Collections.singletonList(item));

        CompraRepository cr = mock(CompraRepository.class);
        MovimentacaoRepository mr = mock(MovimentacaoRepository.class);
        ProdutoRepository pr = mock(ProdutoRepository.class);
        DecarteRepository dr = mock(DecarteRepository.class);

        Produto p = new Produto();
        p.setId(3L);
        p.setPerecivel(Boolean.FALSE);
        p.setUnidadeMedida(UnitMeasurement.KG);

        when(pr.findById(3L)).thenReturn(Optional.of(p));

        com.example.SpringBootApp.repositories.VendaRepository vr = mock(com.example.SpringBootApp.repositories.VendaRepository.class);
        com.example.SpringBootApp.services.ConfiguracaoService cs = mock(com.example.SpringBootApp.services.ConfiguracaoService.class);
        InventarioService svc = new InventarioService(cr, mr, pr, dr, vr, cs);

        assertThrows(BusinessException.class, () -> svc.createPurchase(dto));
    }

    @Test
    public void createPurchase_UNWithDecimalQuantity_throws() {
        CompraCreateDTO dto = new CompraCreateDTO();
        CompraItemDTO item = new CompraItemDTO();
        item.setProductId(4L);
        item.setQuantity(new BigDecimal("1.5"));
        dto.setItems(Collections.singletonList(item));

        CompraRepository cr = mock(CompraRepository.class);
        MovimentacaoRepository mr = mock(MovimentacaoRepository.class);
        ProdutoRepository pr = mock(ProdutoRepository.class);
        DecarteRepository dr = mock(DecarteRepository.class);

        Produto p = new Produto();
        p.setId(4L);
        p.setPerecivel(Boolean.FALSE);
        p.setUnidadeMedida(UnitMeasurement.UN);

        when(pr.findById(4L)).thenReturn(Optional.of(p));

        com.example.SpringBootApp.repositories.VendaRepository vr = mock(com.example.SpringBootApp.repositories.VendaRepository.class);
        com.example.SpringBootApp.services.ConfiguracaoService cs = mock(com.example.SpringBootApp.services.ConfiguracaoService.class);
        InventarioService svc = new InventarioService(cr, mr, pr, dr, vr, cs);

        assertThrows(BusinessException.class, () -> svc.createPurchase(dto));
    }
}
