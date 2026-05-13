package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ProdutoComCompraEmEstoqueDTO;
import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraEmEstoqueDTO;
import com.example.SpringBootApp.DTOs.CompraItemDTO;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.CompraRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.DecarteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class InventarioService {

    private final CompraRepository CompraRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository ProdutoRepository;
    private final DecarteRepository decarteRepository;

    public Compra createPurchase(CompraCreateDTO purchaseDTO) {
        for (CompraItemDTO itemDTO : purchaseDTO.getItems()) {
            ProdutoRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProductId()));
        }

        Compra Compra = new Compra();
        Compra.setDataCompra(purchaseDTO.getDate() != null ? purchaseDTO.getDate() : LocalDate.now());

        Compra savedPurchase = CompraRepository.save(Compra);

        List<Movimentacao> items = new ArrayList<>();
        for (CompraItemDTO itemDTO : purchaseDTO.getItems()) {
            Produto Produto = ProdutoRepository.findById(itemDTO.getProductId()).get();

            // validate expiring date according to product perishability
            if (Boolean.TRUE.equals(Produto.getPerecivel())) {
                if (itemDTO.getExpiringDate() == null) {
                    throw new BusinessException("Expiring date is required for perishable product with id: " + Produto.getId());
                }
            } else {
                if (itemDTO.getExpiringDate() != null) {
                    throw new BusinessException("Expiring date must not be provided for non-perishable product with id: " + Produto.getId());
                }
            }

            // validação: se o produto for UN, quantidade deve ser inteira
            if (Produto.getUnidadeMedida() == UnitMeasurement.UN) {
                if (itemDTO.getQuantity() == null || itemDTO.getQuantity().stripTrailingZeros().scale() > 0) {
                    throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + Produto.getId());
                }
            }

            Movimentacao Movimentacao = new Movimentacao();
            Movimentacao.setQuantidade(itemDTO.getQuantity());
            Movimentacao.setPrecoUnitarioCompra(itemDTO.getUnitPurchasePrice());
            // For purchase movements, sale price must be null
            Movimentacao.setPrecoUnitarioVenda(null);
            Movimentacao.setDataValidade(itemDTO.getExpiringDate());
            Movimentacao.setProduto(Produto);
            Movimentacao.setCompra(savedPurchase);
            Movimentacao.setVenda(null);
            Movimentacao.setTipoMovimentacao(MovementType.COMPRA);

            items.add(movimentacaoRepository.save(Movimentacao));
        }

        savedPurchase.setItens(items);
        return savedPurchase;
    }

    public List<ProdutoComCompraEmEstoqueDTO> getProductsWithPurchaseInStock(){
        List<Produto> products = ProdutoRepository.findAllWithItems()
                .stream()
                .filter(Produto -> !Produto.getItens().isEmpty())
                .toList();
        return products.stream()
                .map(Produto -> {

                    ProdutoComCompraEmEstoqueDTO dto = new ProdutoComCompraEmEstoqueDTO();

                    dto.setId(Produto.getId().intValue());
                    dto.setCode(Produto.getCodigo());
                    dto.setProduct_name(Produto.getNome());
                    dto.setBrand_name(Produto.getMarca() != null ? Produto.getMarca().getNome() : null);
                    dto.setUnitMeasurement(Produto.getUnidadeMedida());

                    List<CompraEmEstoqueDTO> groupedPurchases = groupItemsByPurchase(Produto.getItens());
                    dto.setPurchases(groupedPurchases);

                    return dto;
                })
                .toList();
    }

    private List<CompraEmEstoqueDTO> groupItemsByPurchase(List<Movimentacao> items) {

        return items.stream()
                .filter(Movimentacao -> Movimentacao.getCompra() != null)
                .collect(Collectors.groupingBy(
                        Movimentacao -> Movimentacao.getCompra().getId()
                ))
                .values()
                .stream()
                .map(group -> {

                    Movimentacao reference = group.getFirst();

                    LocalDate purchaseDate = reference.getCompra().getDataCompra();
                    Long purchaseId = reference.getCompra().getId();

                    LocalDate expiration =
                            group.stream()
                                    .map(Movimentacao::getDataValidade)
                                    .filter(Objects::nonNull)
                                    .min(LocalDate::compareTo)
                                    .orElse(null);

                    BigDecimal totalQuantity =
                            group.stream()
                                    .map(Movimentacao::getQuantidade)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                    CompraEmEstoqueDTO dto = new CompraEmEstoqueDTO();
                    dto.setPurchase_id(purchaseId);
                    dto.setPurchase_date(purchaseDate);
                    dto.setExpiring_date(expiration);
                    dto.setQuantity(totalQuantity);
                    dto.setUnitSalePrice(reference.getPrecoUnitarioVenda());

                    return dto;
                })
                .toList();
    }

    public Movimentacao updatePurchaseItem(Long purchaseId, Long productId, BigDecimal newQuantity, BigDecimal newUnitPurchasePrice, LocalDate newExpiringDate) {
        if (newQuantity == null || newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Quantity must be positive");
        }

        Movimentacao purchaseMov = movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId);
        if (purchaseMov == null) {
            throw new ResourceNotFoundException("Purchase item not found");
        }

        BigDecimal oldQuantity = purchaseMov.getQuantidade() != null ? purchaseMov.getQuantidade() : BigDecimal.ZERO;

        List<Movimentacao> group = movimentacaoRepository.findByCompraIdAndProdutoId(purchaseId, productId);
        BigDecimal groupSum = group.stream().map(m -> m.getQuantidade() != null ? m.getQuantidade() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal groupAfter = groupSum.add(newQuantity.subtract(oldQuantity));
        if (groupAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Cannot reduce purchase quantity below already sold quantity for this lot");
        }

        BigDecimal totalSum = movimentacaoRepository.sumQuantityByProdutoId(productId);
        if (totalSum == null) totalSum = BigDecimal.ZERO;
        BigDecimal totalAfter = totalSum.add(newQuantity.subtract(oldQuantity));
        if (totalAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Stock would become negative");
        }

        // Validate and apply expiring date changes (do not allow making an expired product having been sold)
        Produto produto = purchaseMov.getProduto();

        // validação: se o produto for UN, nova quantidade deve ser inteira
        if (produto != null && produto.getUnidadeMedida() == UnitMeasurement.UN) {
            if (newQuantity == null || newQuantity.stripTrailingZeros().scale() > 0) {
                throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + produto.getId());
            }
        }

        if (newExpiringDate != null) {
            if (!Boolean.TRUE.equals(produto.getPerecivel())) {
                throw new BusinessException("Expiring date must not be provided for non-perishable product with id: " + produto.getId());
            }
            for (Movimentacao m : group) {
                if (m.getVenda() != null && m.getVenda().getDataVenda() != null) {
                    LocalDate saleDate = m.getVenda().getDataVenda();
                    if (newExpiringDate.isBefore(saleDate)) {
                        throw new BusinessException("Cannot set expiration date before existing sale date: " + saleDate);
                    }
                }
            }
        }

        // Apply unit purchase price if provided
        if (newUnitPurchasePrice != null) {
            if (newUnitPurchasePrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Unit purchase price must be positive");
            }
            purchaseMov.setPrecoUnitarioCompra(newUnitPurchasePrice);
        }

        purchaseMov.setQuantidade(newQuantity);
        if (newExpiringDate != null) purchaseMov.setDataValidade(newExpiringDate);
        return movimentacaoRepository.save(purchaseMov);
    }

    public List<java.util.Map<String, Object>> getDiscards() {
        return decarteRepository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "disposalDate")).stream()
            .map(d -> {
                java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
                map.put("id", d.getId());
                map.put("date", d.getDisposalDate());
                map.put("type", d.getMotivo() != null ? d.getMotivo().name() : null);
                List<java.util.Map<String, Object>> items = new ArrayList<>();
                if (d.getMovements() != null) {
                    d.getMovements().stream()
                        .filter(m -> m.getTipoMovimentacao() == MovementType.DESCARTE)
                        .forEach(m -> {
                            java.util.Map<String, Object> item = new java.util.LinkedHashMap<>();
                            item.put("productName", m.getProduto() != null ? m.getProduto().getNome() : "");
                            item.put("quantity", m.getQuantidade() != null ? m.getQuantidade().abs() : BigDecimal.ZERO);
                            item.put("unitMeasurement", m.getProduto() != null && m.getProduto().getUnidadeMedida() != null
                                ? m.getProduto().getUnidadeMedida().name() : "");
                            items.add(item);
                        });
                }
                map.put("items", items);
                return map;
            }).collect(Collectors.toList());
    }

    public Descarte createDiscard(com.example.SpringBootApp.DTOs.DescarteCreateDTO discardDTO) {
        if (discardDTO == null || discardDTO.getItems() == null || discardDTO.getItems().isEmpty()) {
            throw new BusinessException("Discard must contain at least one item");
        }

        // Validate each lot (purchase) individually and build total map per product
        java.util.Map<Long, java.math.BigDecimal> totalByProduct = new java.util.HashMap<>();
        for (com.example.SpringBootApp.DTOs.DescarteItemDTO item : discardDTO.getItems()) {
            if (item.getQuantity() == null || item.getQuantity().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Quantity must be positive");
            }

            Movimentacao purchaseMov = movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(item.getPurchaseId(), item.getProductId());
            if (purchaseMov == null) {
                throw new ResourceNotFoundException("Purchase item not found");
            }

            // validação: se o produto for UN, quantidade do descarte deve ser inteira
            Produto produto = purchaseMov.getProduto();
            if (produto != null && produto.getUnidadeMedida() == UnitMeasurement.UN) {
                if (item.getQuantity() == null || item.getQuantity().stripTrailingZeros().scale() > 0) {
                    throw new BusinessException("Quantidade deve ser inteira para produto com unidade UN id: " + produto.getId());
                }
            }

            java.util.List<Movimentacao> group = movimentacaoRepository.findByCompraIdAndProdutoId(item.getPurchaseId(), item.getProductId());
            java.math.BigDecimal groupSum = group.stream().map(m -> m.getQuantidade() != null ? m.getQuantidade() : java.math.BigDecimal.ZERO).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            java.math.BigDecimal groupAfter = groupSum.subtract(item.getQuantity());
            if (groupAfter.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new BusinessException("Cannot discard more than available in this lot");
            }

            totalByProduct.merge(item.getProductId(), item.getQuantity(), java.math.BigDecimal::add);
        }

        // Validate global stock per product (considering all items in this discard)
        for (java.util.Map.Entry<Long, java.math.BigDecimal> e : totalByProduct.entrySet()) {
            Long productId = e.getKey();
            java.math.BigDecimal totalSum = movimentacaoRepository.sumQuantityByProdutoId(productId);
            if (totalSum == null) totalSum = java.math.BigDecimal.ZERO;
            java.math.BigDecimal totalAfter = totalSum.subtract(e.getValue());
            if (totalAfter.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new BusinessException("Stock would become negative");
            }
        }

        // Create Descarte record (single group)
        Descarte descarte = new Descarte();
        descarte.setDisposalDate(discardDTO.getDate() != null ? discardDTO.getDate() : LocalDate.now());
        descarte.setMotivo(discardDTO.getType() != null ? discardDTO.getType() : DescarteType.OUTRO);
        Descarte savedDescarte = decarteRepository.save(descarte);

        // Create a Movimentacao (negative) for each item in the discard
        for (com.example.SpringBootApp.DTOs.DescarteItemDTO item : discardDTO.getItems()) {
            Movimentacao purchaseMov = movimentacaoRepository.findFirstByCompraIdAndProdutoIdAndVendaIsNull(item.getPurchaseId(), item.getProductId());
            Movimentacao discardMov = new Movimentacao();
            discardMov.setQuantidade(item.getQuantity().negate());
            discardMov.setPrecoUnitarioCompra(null);
            discardMov.setPrecoUnitarioVenda(null);
            discardMov.setDataValidade(null);
            discardMov.setProduto(purchaseMov.getProduto());
            discardMov.setCompra(purchaseMov.getCompra());
            discardMov.setVenda(null);
            discardMov.setTipoMovimentacao(MovementType.DESCARTE);
            discardMov.setDescarte(savedDescarte);
            movimentacaoRepository.save(discardMov);
        }

        return savedDescarte;
    }

}



