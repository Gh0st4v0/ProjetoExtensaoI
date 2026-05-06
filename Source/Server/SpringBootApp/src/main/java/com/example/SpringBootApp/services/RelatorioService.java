package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendItemReportDTO;
import com.example.SpringBootApp.DTOs.VendReportDTO;
import com.example.SpringBootApp.models.Movimentacao;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.repositories.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RelatorioService {

    private final VendaRepository vendaRepository;

    public List<VendReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate) {
        List<Venda> sales = vendaRepository.findByDatavendaBetweenWithMovements(startDate, endDate);

        return sales.stream()
                .map(this::convertToVendReportDTO)
                .collect(Collectors.toList());
    }

    private VendReportDTO convertToVendReportDTO(Venda venda) {
        VendReportDTO reportDTO = new VendReportDTO();

        reportDTO.setId(venda.getId());
        reportDTO.setSaleDate(venda.getDataVenda());
        reportDTO.setPaymentMethod(venda.getMetodoPagamento().name());
        reportDTO.setSalesmanName(venda.getUsuario().getNome());
        reportDTO.setHasDiscount(venda.getTemDesconto());

        List<VendItemReportDTO> itemDTOs = venda.getItens().stream()
                .filter(movimentacao -> movimentacao.getQuantidade().compareTo(BigDecimal.ZERO) < 0)
                .map(this::convertToVendItemReportDTO)
                .collect(Collectors.toList());

        reportDTO.setItems(itemDTOs);

        BigDecimal totalPrice = itemDTOs.stream()
                .map(itemDTO -> itemDTO.getSalePrice().multiply(itemDTO.getQuantity().abs()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = itemDTOs.stream()
                .map(itemDTO -> itemDTO.getPurchasePrice().multiply(itemDTO.getQuantity().abs()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        reportDTO.setTotalCost(totalCost);
        reportDTO.setTotalPrice(totalPrice);

        return reportDTO;
    }

    private VendItemReportDTO convertToVendItemReportDTO(Movimentacao movimentacao) {
        VendItemReportDTO itemDTO = new VendItemReportDTO();

        itemDTO.setProductName(movimentacao.getProduto().getNome());
        itemDTO.setMarca(movimentacao.getProduto().getMarca().getNome());
        itemDTO.setCategoria(movimentacao.getProduto().getCategoria().getNome());
        itemDTO.setQuantity(movimentacao.getQuantidade().abs());
        itemDTO.setPurchasePrice(movimentacao.getPrecoUnitarioCompra());
        itemDTO.setSalePrice(movimentacao.getPrecoUnitarioVenda());
        itemDTO.setTotal(itemDTO.getSalePrice().multiply(itemDTO.getQuantity()));

        return itemDTO;
    }
}




