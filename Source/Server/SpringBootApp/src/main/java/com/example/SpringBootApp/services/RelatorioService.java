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
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RelatorioService {

    private final VendaRepository vendaRepository;

    public List<VendReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate) {
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        List<Venda> sales = vendaRepository.findByDatavendaBetweenWithMovements(start, end);

        return sales.stream()
                .map(this::convertToVendReportDTO)
                .collect(Collectors.toList());
    }

    public List<com.example.SpringBootApp.DTOs.ClientSpendDTO> getClientSpending(LocalDate startDate, LocalDate endDate) {
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        List<Venda> sales = vendaRepository.findByDatavendaBetweenWithMovements(start, end);

        java.util.Map<Long, com.example.SpringBootApp.DTOs.ClientSpendDTO> map = new java.util.LinkedHashMap<>();
        for (Venda v : sales) {
            if (v.getCliente() == null) continue;
            Long cid = v.getCliente().getId();
            com.example.SpringBootApp.DTOs.ClientSpendDTO dto = map.get(cid);
            java.math.BigDecimal valor = v.getValorTotal() != null ? v.getValorTotal() : java.math.BigDecimal.ZERO;
            if (dto == null) {
                dto = new com.example.SpringBootApp.DTOs.ClientSpendDTO();
                dto.setClienteId(cid);
                dto.setNickname(v.getCliente().getNickname());
                dto.setTotalSpent(valor);
                map.put(cid, dto);
            } else {
                dto.setTotalSpent(dto.getTotalSpent().add(valor));
            }
        }

        return map.values().stream()
                .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()))
                .collect(Collectors.toList());
    }

    private VendReportDTO convertToVendReportDTO(Venda venda) {
        VendReportDTO reportDTO = new VendReportDTO();

        reportDTO.setId(venda.getId());
        reportDTO.setSaleDate(venda.getDataVenda());
        String pm = null;
        List<com.example.SpringBootApp.models.VendaPagamento> pagamentos = venda.getPagamentos();
        if (pagamentos != null && !pagamentos.isEmpty()) {
            // build combined payment method (first or concat of distinct)
            java.util.Set<String> methods = pagamentos.stream()
                    .map(p -> p.getMetodoPagamento() != null ? p.getMetodoPagamento().name() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
            pm = String.join("+", methods);

            // map payments to DTO
            List<com.example.SpringBootApp.DTOs.VendaPagamentoDTO> payDTOs = pagamentos.stream().map(p -> {
                com.example.SpringBootApp.DTOs.VendaPagamentoDTO pd = new com.example.SpringBootApp.DTOs.VendaPagamentoDTO();
                pd.setPaymentMethod(p.getMetodoPagamento() != null ? p.getMetodoPagamento().name() : null);
                pd.setValor(p.getValor());
                pd.setAcrescimoPercent(p.getAcrescimoPercent());
                pd.setAcrescimoValor(p.getAcrescimoValor());
                pd.setValorPago(p.getValorPago());
                // parcelas and referencia were removed from VendaPagamento entity; not available anymore
                return pd;
            }).collect(Collectors.toList());
            reportDTO.setPayments(payDTOs);

            java.math.BigDecimal surcharge = pagamentos.stream()
                    .map(com.example.SpringBootApp.models.VendaPagamento::getAcrescimoValor)
                    .filter(v -> v != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            reportDTO.setSurchargeTotal(surcharge);
        }
        reportDTO.setPaymentMethod(pm);
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




