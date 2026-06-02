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
    private final com.example.SpringBootApp.repositories.VendaRepository vendaRepository;
    private final com.example.SpringBootApp.services.ConfiguracaoService configuracaoService;

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
                    dto.setMinStock(Produto.getEstoqueMinimo());

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

                    // Exclude fully-sold lots (net quantity <= 0)
                    if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                        return null;
                    }

                    CompraEmEstoqueDTO dto = new CompraEmEstoqueDTO();
                    dto.setPurchase_id(purchaseId);
                    dto.setPurchase_date(purchaseDate);
                    dto.setExpiring_date(expiration);
                    dto.setQuantity(totalQuantity);
                    dto.setUnitSalePrice(reference.getPrecoUnitarioVenda());

                    return dto;
                })
                .filter(Objects::nonNull)
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
                    java.time.LocalDate saleDate = m.getVenda().getDataVenda().toLocalDate();
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

    public java.util.Map<String, Object> getAlerts(Integer expiryDays) {
        int days = expiryDays != null ? expiryDays : 7;
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate limit = now.plusDays(days);

        java.util.List<java.util.Map<String, Object>> expiryAlerts = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, Object>> lowStockAlerts = new java.util.ArrayList<>();

        // Expiry alerts: iterate products with items in stock and use grouped purchases
        java.util.List<Produto> productsWithItems = ProdutoRepository.findAllWithItems();
        for (Produto p : productsWithItems) {
            if (p.getItens() == null || p.getItens().isEmpty()) continue;
            java.util.List<CompraEmEstoqueDTO> grouped = groupItemsByPurchase(p.getItens());
            for (CompraEmEstoqueDTO c : grouped) {
                if (c.getExpiring_date() != null && !c.getExpiring_date().isAfter(limit)) {
                    long daysToExpiry = java.time.temporal.ChronoUnit.DAYS.between(now, c.getExpiring_date());
                    java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("type", "expiry");
                    map.put("productId", p.getId());
                    map.put("productName", p.getNome());
                    map.put("brandName", p.getMarca() != null ? p.getMarca().getNome() : null);
                    map.put("unitMeasurement", p.getUnidadeMedida() != null ? p.getUnidadeMedida().name() : "KG");
                    map.put("purchaseId", c.getPurchase_id());
                    map.put("expiringDate", c.getExpiring_date());
                    map.put("quantity", c.getQuantity());
                    map.put("daysToExpiry", daysToExpiry);
                    // Human-friendly title and message
                    String title = p.getNome() + (p.getMarca() != null && p.getMarca().getNome() != null ? " (" + p.getMarca().getNome() + ")" : "");
                    map.put("title", title);
                    String expDateStr = c.getExpiring_date() != null ? c.getExpiring_date().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : null;
                    map.put("message", "Lote " + c.getPurchase_id() + " vence em " + daysToExpiry + " dia(s) — " + expDateStr);
                    expiryAlerts.add(map);
                }
            }
        }

        expiryAlerts.sort(java.util.Comparator.comparingLong(m -> (long) m.get("daysToExpiry")));

        // Low-stock alerts: iterate all products and compare current stock to estoqueMinimo (default 5)
        java.util.List<Produto> allProducts = ProdutoRepository.findAll();
        for (Produto p : allProducts) {
            Integer minStock = p.getEstoqueMinimo() != null ? p.getEstoqueMinimo() : 5;
            java.math.BigDecimal total = movimentacaoRepository.sumQuantityByProdutoId(p.getId());
            if (total == null) total = java.math.BigDecimal.ZERO;
            if (total.compareTo(java.math.BigDecimal.valueOf(minStock)) < 0) {
                java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
                map.put("type", "low_stock");
                map.put("productId", p.getId());
                map.put("productName", p.getNome());
                map.put("brandName", p.getMarca() != null ? p.getMarca().getNome() : null);
                map.put("unitMeasurement", p.getUnidadeMedida() != null ? p.getUnidadeMedida().name() : "KG");
                map.put("currentStock", total);
                map.put("minStock", minStock);
                // Human-friendly title and message
                String title = p.getNome() + (p.getMarca() != null && p.getMarca().getNome() != null ? " (" + p.getMarca().getNome() + ")" : "");
                map.put("title", title);
                map.put("message", "Estoque atual: " + total + " — Mínimo definido: " + minStock);
                lowStockAlerts.add(map);
            }
        }

        // Daily margin summary: aggregate all of today's sales into a single metric
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        java.time.LocalDateTime endOfDay = startOfDay.plusDays(1);
        java.util.List<Venda> vendas = vendaRepository.findByDatavendaBetweenWithMovements(startOfDay, endOfDay);

        java.math.BigDecimal totalRevenue = java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalCost    = java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalFees    = java.math.BigDecimal.ZERO;
        com.example.SpringBootApp.models.Configuracao latestCfg = null;

        for (Venda v : vendas) {
            if (v.getValorTotal() == null || v.getValorTotal().compareTo(java.math.BigDecimal.ZERO) <= 0) continue;
            com.example.SpringBootApp.models.Configuracao cfg = configuracaoService.getConfiguracaoForDate(v.getDataVenda());
            if (latestCfg == null) latestCfg = cfg;
            totalRevenue = totalRevenue.add(v.getValorTotal());
            if (v.getItens() != null) {
                for (Movimentacao m : v.getItens()) {
                    java.math.BigDecimal qty      = m.getQuantidade() != null ? m.getQuantidade().abs() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal unitCost = m.getPrecoUnitarioCompra() != null ? m.getPrecoUnitarioCompra() : java.math.BigDecimal.ZERO;
                    totalCost = totalCost.add(qty.multiply(unitCost));
                }
            }
            if (v.getPagamentos() != null) {
                for (VendaPagamento vp : v.getPagamentos()) {
                    java.math.BigDecimal valor   = vp.getValor() != null ? vp.getValor() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal percent = java.math.BigDecimal.ZERO;
                    if (vp.getMetodoPagamento() == com.example.SpringBootApp.models.PaymentMethod.CREDITO) {
                        percent = cfg != null && cfg.getTaxaCredito() != null ? cfg.getTaxaCredito() : new java.math.BigDecimal("3.50");
                    } else if (vp.getMetodoPagamento() == com.example.SpringBootApp.models.PaymentMethod.DEBITO) {
                        percent = cfg != null && cfg.getTaxaDebito() != null ? cfg.getTaxaDebito() : new java.math.BigDecimal("2.50");
                    }
                    totalFees = totalFees.add(valor.multiply(percent).divide(new java.math.BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP));
                }
            }
        }

        java.math.BigDecimal expectedMargin = latestCfg != null && latestCfg.getLucroEsperado() != null
                ? latestCfg.getLucroEsperado() : new java.math.BigDecimal("20.00");
        java.math.BigDecimal grossProfit = totalRevenue.subtract(totalCost).subtract(totalFees);
        java.math.BigDecimal grossMarginPct = totalRevenue.compareTo(java.math.BigDecimal.ZERO) == 0
                ? java.math.BigDecimal.ZERO
                : grossProfit.divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP).multiply(new java.math.BigDecimal("100"));

        java.util.Map<String, Object> dailyMarginSummary = new java.util.LinkedHashMap<>();
        dailyMarginSummary.put("hasData",       !vendas.isEmpty());
        dailyMarginSummary.put("salesCount",    vendas.size());
        dailyMarginSummary.put("revenue",       totalRevenue.setScale(2, java.math.RoundingMode.HALF_UP));
        dailyMarginSummary.put("cost",          totalCost.setScale(2, java.math.RoundingMode.HALF_UP));
        dailyMarginSummary.put("grossMargin",   grossMarginPct.setScale(2, java.math.RoundingMode.HALF_UP));
        dailyMarginSummary.put("expectedMargin",expectedMargin.setScale(2, java.math.RoundingMode.HALF_UP));
        dailyMarginSummary.put("belowTarget",   !vendas.isEmpty() && grossMarginPct.compareTo(expectedMargin) < 0);

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("expiryAlerts",       expiryAlerts);
        result.put("lowStockAlerts",     lowStockAlerts);
        result.put("dailyMarginSummary", dailyMarginSummary);
        return result;
    }

    public org.springframework.data.domain.Page<java.util.Map<String, Object>> getDiscards(
            java.time.LocalDate startDate, java.time.LocalDate endDate,
            org.springframework.data.domain.Pageable pageable) {
        List<Descarte> all = null;
        // Prefer legacy repository method (helps unit tests that mock it). If it fails (e.g., JDBC type ambiguity),
        // fall back to safer, explicitly-typed query methods.
        try {
            all = decarteRepository.findByDateRange(startDate, endDate);
        } catch (Throwable ignored) {
            all = null;
        }

        if (all == null) {
            if (startDate == null && endDate == null) {
                all = decarteRepository.findAllWithMovements();
            } else if (startDate != null && endDate != null) {
                all = decarteRepository.findByDisposalDateBetweenWithMovements(startDate, endDate);
            } else if (startDate != null) {
                all = decarteRepository.findByDisposalDateGreaterThanEqualWithMovements(startDate);
            } else {
                all = decarteRepository.findByDisposalDateLessThanEqualWithMovements(endDate);
            }
        }

        List<java.util.Map<String, Object>> mapped = all.stream().map(d -> {
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

        int start = (int) pageable.getOffset();
        List<java.util.Map<String, Object>> pageContent = start >= mapped.size()
            ? java.util.Collections.emptyList()
            : mapped.subList(start, Math.min(start + pageable.getPageSize(), mapped.size()));
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, mapped.size());
    }

    public Descarte updateDiscard(Long id, com.example.SpringBootApp.DTOs.DescarteUpdateDTO dto) {
        Descarte descarte = decarteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Descarte not found: " + id));
        if (dto.getDate() != null) descarte.setDisposalDate(dto.getDate());
        if (dto.getType() != null) descarte.setMotivo(dto.getType());
        return decarteRepository.save(descarte);
    }

    public void deleteDiscard(Long id) {
        Descarte descarte = decarteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Descarte not found: " + id));
        java.util.List<Movimentacao> movements = movimentacaoRepository.findByDescarte_Id(id);
        movimentacaoRepository.deleteAll(movements);
        decarteRepository.delete(descarte);
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



