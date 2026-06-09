package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.models.Marca;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.UnitMeasurement;
import com.example.SpringBootApp.services.CatalogoService;
import com.example.SpringBootApp.services.InventarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ProdutoControllerExtraTest {

    private MockMvc mockMvc;
    private CatalogoService catalogoService;
    private InventarioService inventarioService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setup() {
        catalogoService = mock(CatalogoService.class);
        inventarioService = mock(InventarioService.class);
        ProdutoController controller = new ProdutoController(catalogoService, inventarioService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    public void createProduct_returnsCreated() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("name", "P");
        body.put("unitMeasurement", "KG");
        body.put("code", "ABC123");
        body.put("perecivel", false);
        body.put("precoVenda", "10.00");
        body.put("categoryId", 1);
        body.put("brandId", 2);

        Produto p = new Produto();
        p.setId(100L);
        when(catalogoService.createProducts(any())).thenReturn(p);

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/products/100"));
    }

    @Test
    public void getProductById_withCategoryAndBrand() throws Exception {
        Produto p = new Produto();
        p.setId(1L);
        p.setNome("X");
        p.setCodigo("C1");
        p.setUnidadeMedida(UnitMeasurement.KG);
        p.setIsPerecivel(false);
        p.setPrecoVenda(new BigDecimal("99.99"));
        Categoria c = new Categoria();
        c.setId(2L);
        c.setNome("Cat");
        p.setCategoria(c);
        Marca m = new Marca();
        m.setId(3L);
        m.setNome("M");
        p.setMarca(m);

        when(catalogoService.getProductById(1L)).thenReturn(p);

        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.categoryId").value(2))
                .andExpect(jsonPath("$.brandName").value("M"));
    }

    @Test
    public void getProductById_nullCategoryBrand() throws Exception {
        Produto p = new Produto();
        p.setId(2L);
        p.setNome("Y");
        p.setCodigo("C2");

        when(catalogoService.getProductById(2L)).thenReturn(p);

        mockMvc.perform(get("/products/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value(nullValue()))
                .andExpect(jsonPath("$.brandId").value(nullValue()));
    }

    @Test
    public void deleteProduct_returnsNoContent() throws Exception {
        doNothing().when(catalogoService).deleteProduct(5L);

        mockMvc.perform(delete("/products/5"))
                .andExpect(status().isNoContent());

        verify(catalogoService).deleteProduct(5L);
    }

    @Test
    public void updateProductPrice_returnsOkWithLocation() throws Exception {
        Map<String, Object> price = new HashMap<>();
        price.put("precoVenda", "123.45");
        Produto updated = new Produto();
        updated.setId(6L);
        when(catalogoService.updateProductPrice(eq(6L), any(BigDecimal.class))).thenReturn(updated);

        mockMvc.perform(patch("/products/6/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(price)))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/products/6"));
    }
}
