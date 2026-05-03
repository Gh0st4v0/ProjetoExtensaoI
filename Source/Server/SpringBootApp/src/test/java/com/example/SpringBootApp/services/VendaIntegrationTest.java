package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendItemDTO;
import com.example.SpringBootApp.models.*;
import com.example.SpringBootApp.repositories.*;
import com.example.SpringBootApp.services.VendaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
public class VendaIntegrationTest {

    @Autowired
    private VendaService vendaService;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void createSale_reducesStock_andCreatesMovimentacao() {
        // Arrange: create usuario, produto, compra and a purchase movimentacao
        Usuario usuario = new Usuario();
        usuario.setNome("Integracao User");
        usuario = usuarioRepository.save(usuario);

        Produto produto = new Produto();
        produto.setNome("Produto Integracao");
        produto.setUnidadeMedida(UnitMeasurement.UN);
        produto.setPrecoVenda(new BigDecimal("20.0000"));
        Produto savedProduto = produtoRepository.save(produto);

        Compra compra = new Compra();
        compra.setDataCompra(LocalDate.now());
        compra = compraRepository.save(compra);

        Movimentacao compraMov = new Movimentacao();
        compraMov.setProduto(savedProduto);
        compraMov.setCompra(compra);
        compraMov.setTipoMovimentacao(MovementType.COMPRA);
        compraMov.setQuantidade(new BigDecimal("10.0000"));
        compraMov.setPrecoUnitarioCompra(new BigDecimal("10.0000"));
        movimentacaoRepository.save(compraMov);

        BigDecimal before = movimentacaoRepository.sumQuantityByProdutoId(savedProduto.getId());
        assertEquals(0, before.compareTo(new BigDecimal("10.0000")));

        // Act: create a sale of quantity 2
        VendItemDTO item = new VendItemDTO(null, savedProduto.getId(), new BigDecimal("2.0000"), null);
        VendCreateDTO create = new VendCreateDTO(LocalDate.now(), new BigDecimal("40.0000"), PaymentMethod.PIX, false, usuario.getId(), null, List.of(item));

        vendaService.createSale(create);

        // Assert: stock decreased by 2 and a sale movimentacao exists
        BigDecimal after = movimentacaoRepository.sumQuantityByProdutoId(savedProduto.getId());
        assertEquals(0, after.compareTo(new BigDecimal("8.0000")));

        boolean hasSaleMov = movimentacaoRepository.findAll().stream()
                .anyMatch(m -> m.getTipoMovimentacao() == MovementType.VENDA && m.getProduto() != null
                        && m.getProduto().getId().equals(savedProduto.getId())
                        && m.getQuantidade().compareTo(new BigDecimal("-2.0000")) == 0);

        assertTrue(hasSaleMov, "Expected a VENDA movimentacao with quantity -2.0000");
    }
}
