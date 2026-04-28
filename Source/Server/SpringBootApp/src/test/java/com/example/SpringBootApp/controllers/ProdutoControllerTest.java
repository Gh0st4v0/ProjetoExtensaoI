package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ProdutoCreateDTO;
import com.example.SpringBootApp.DTOs.ProdutoResponseDTO;
import com.example.SpringBootApp.DTOs.ProdutoComCompraEmEstoqueDTO;
import com.example.SpringBootApp.DTOs.ProdutoQuantidadeEstoqueDTO;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.exceptions.ResourceAlreadyExistsException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.services.CatalogoService;
import com.example.SpringBootApp.services.InventarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProdutoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogoService catalogService;

    @Mock
    private InventarioService inventarioService;

    @InjectMocks
    private ProdutoController produtoController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(produtoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createProduto_ShouldReturn201_WhenValidInput() throws Exception {
        setup();

        // Arrange
        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001001", false, new java.math.BigDecimal("10.00"), 1L, 1L);
        Produto savedProduto = new Produto();
        savedProduto.setId(1L);
        savedProduto.setNome("Picanha");
        savedProduto.setUnidadeMedida(UnitMeasurement.KG);
        savedProduto.setCodigo("001001");

        when(catalogService.createProducts(any(ProdutoCreateDTO.class))).thenReturn(savedProduto);

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", "/products/1"));
    }

    @Test
    void createProduto_ShouldReturn409_WhenCodeAlreadyExists() throws Exception {
        setup();

        // Arrange
        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001001", false, new java.math.BigDecimal("10.00"), 1L, 1L);

        when(catalogService.createProducts(any(ProdutoCreateDTO.class)))
                .thenThrow(new ResourceAlreadyExistsException("Product code already exists"));

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Product code already exists"));
    }

    @Test
    void createProduto_ShouldReturn404_WhenCategoryNotFound() throws Exception {
        setup();

        // Arrange
        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001001", false, new java.math.BigDecimal("10.00"), 999L, 1L);

        when(catalogService.createProducts(any(ProdutoCreateDTO.class)))
                .thenThrow(new ResourceNotFoundException("Category not found"));

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Category not found"));
    }

    @Test
    void createProduto_ShouldReturn404_WhenBrandNotFound() throws Exception {
        setup();

        // Arrange
        ProdutoCreateDTO request = new ProdutoCreateDTO("Picanha", UnitMeasurement.KG, "001001", false, new java.math.BigDecimal("10.00"), 1L, 999L);

        when(catalogService.createProducts(any(ProdutoCreateDTO.class)))
                .thenThrow(new ResourceNotFoundException("Brand not found"));

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Brand not found"));
    }

    @Test
    void createProduto_ShouldReturn422_WhenInvalidUnitMeasurement() throws Exception {
        setup();

        // Arrange
        String invalidJson = """
        {
            "name": "Picanha",
            "unitMeasurement": null,
            "code": 1001,
            "categoryId": 1,
            "brandId": 1
        }
        """;

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProduto_ShouldReturn400_WhenMissingRequiredFields() throws Exception {
        setup();

        // Arrange
        String invalidJson = "{}";

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProduto_ShouldReturn400_WhenNameIsBlank() throws Exception {
        setup();

        // Arrange
        String invalidJson = """
        {
            "name": "",
            "unitMeasurement": "KG",
            "code": 1001,
            "categoryId": 1,
            "brandId": 1
        }
        """;

        // Act & Assert
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllProducts_ShouldReturn200_WithListOfProducts() throws Exception {
        setup();

        // Arrange
        ProdutoResponseDTO produto1 = new ProdutoResponseDTO();
        produto1.setId(1L);
        produto1.setName("Picanha");
        produto1.setCode("001001");
        produto1.setBrandName("Friboi");
        produto1.setUnitMeasurement("KG");

        ProdutoResponseDTO produto2 = new ProdutoResponseDTO();
        produto2.setId(2L);
        produto2.setName("Alcatra");
        produto2.setCode("001002");
        produto2.setBrandName("Sadia");
        produto2.setUnitMeasurement("KG");

        List<ProdutoResponseDTO> products = List.of(produto1, produto2);

        when(catalogService.getAllProducts()).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Picanha"))
                .andExpect(jsonPath("$[0].code").value("001001"))
                .andExpect(jsonPath("$[0].brandName").value("Friboi"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Alcatra"));
    }

    @Test
    void getAllProducts_ShouldReturn200_WithEmptyList() throws Exception {
        setup();

        // Arrange
        when(catalogService.getAllProducts()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getProductsWithPurchasesInStock_ShouldReturn200_WithListOfProducts() throws Exception {
        setup();

        // Arrange
        ProdutoComCompraEmEstoqueDTO produto = new ProdutoComCompraEmEstoqueDTO();
        produto.setId(1);
        produto.setProduct_name("Picanha");
        produto.setCode("001001");
        produto.setBrand_name("Friboi");
        produto.setUnitMeasurement(UnitMeasurement.KG);
        produto.setPurchases(new ArrayList<>());

        List<ProdutoComCompraEmEstoqueDTO> products = List.of(produto);

        when(inventarioService.getProductsWithPurchaseInStock()).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get("/products/purchases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].product_name").value("Picanha"))
                .andExpect(jsonPath("$[0].code").value("001001"))
                .andExpect(jsonPath("$[0].brand_name").value("Friboi"));
    }

    @Test
    void getProductsWithPurchasesInStock_ShouldReturn200_WithEmptyList() throws Exception {
        setup();

        // Arrange
        when(inventarioService.getProductsWithPurchaseInStock()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/products/purchases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void searchProductsWithStock_ShouldReturn200_WithPaginatedProducts() throws Exception {
        setup();

        // Arrange
        ProdutoQuantidadeEstoqueDTO produto = new ProdutoQuantidadeEstoqueDTO(
                1L,
                "Picanha",
                "001001",
                "Friboi",
                "",
                new BigDecimal("15.5")
        );

        Page<ProdutoQuantidadeEstoqueDTO> resultPage = new PageImpl<>(
                List.of(produto),
                PageRequest.of(0, 10),
                1
        );

        when(catalogService.searchProductsWithStock("pi", 0)).thenReturn(resultPage);

        // Act & Assert
        mockMvc.perform(get("/products/search")
                        .param("q", "pi")
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Picanha"))
                .andExpect(jsonPath("$.content[0].code").value("001001"))
                .andExpect(jsonPath("$.content[0].brandName").value("Friboi"))
                .andExpect(jsonPath("$.content[0].stockQuantity").value(15.5))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(10));

        verify(catalogService).searchProductsWithStock(eq("pi"), eq(0));
    }

    @Test
    void searchProductsWithStock_ShouldReturn200_WithEmptyPage_WhenQueryIsMissing() throws Exception {
        setup();

        // Arrange
        when(catalogService.searchProductsWithStock(null, 0)).thenReturn(Page.empty(PageRequest.of(0, 10)));

        // Act & Assert
        mockMvc.perform(get("/products/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty());

        verify(catalogService).searchProductsWithStock(null, 0);
    }
}

