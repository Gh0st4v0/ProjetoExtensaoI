package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.*;
import com.example.SpringBootApp.exceptions.ResourceAlreadyExistsException;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.Marca;
import com.example.SpringBootApp.models.Categoria;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.repositories.MarcaRepository;
import com.example.SpringBootApp.repositories.CategoriaRepository;
import com.example.SpringBootApp.repositories.ProdutoRepository;
import com.example.SpringBootApp.repositories.MovimentacaoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CatalogoService {

	private final ProdutoRepository ProdutoRepository;

	private final CategoriaRepository CategoriaRepository;

	private final MarcaRepository MarcaRepository;

	private final MovimentacaoRepository MovimentacaoRepository;

	public Produto createProducts(ProdutoCreateDTO productDTO) {
		String code = productDTO.getCode();
		if (code == null || !code.matches("^[A-Za-z0-9]{6}$")) {
			throw new BusinessException("Product code must be exactly 6 alphanumeric characters");
		}

		Categoria Categoria = CategoriaRepository.findById(productDTO.getCategoryId())
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));

		Marca Marca = MarcaRepository.findById(productDTO.getBrandId())
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

		if (ProdutoRepository.existsByCodigo(code)) {
			throw new ResourceAlreadyExistsException("Product code already exists");
		}

		Produto Produto = new Produto();
		Produto.setNome(productDTO.getName());
		Produto.setUnidadeMedida(productDTO.getUnitMeasurement());
		Produto.setCodigo(code);
		Produto.setPerecivel(productDTO.getPerecivel());
		Produto.setPrecoVenda(productDTO.getPrecoVenda());
		Produto.setCategoria(Categoria);
		Produto.setMarca(Marca);

		return ProdutoRepository.save(Produto);
	}

	public Categoria createCategory(CategoriaCreateDTO CategoriaDTO) {
		String normalized = normalize(CategoriaDTO.getName());
		List<Categoria> existing = CategoriaRepository.findAll();
		for (Categoria c : existing) {
			if (normalize(c.getNome()).equals(normalized)) {
				throw new ResourceAlreadyExistsException("Category name already exists");
			}
		}

		Categoria Categoria = new Categoria();
		Categoria.setNome(CategoriaDTO.getName());

		return CategoriaRepository.save(Categoria);
	}

	public Marca createBrand(MarcaCreateDTO MarcaDTO) {
		String normalized = normalize(MarcaDTO.getName());
		List<Marca> existing = MarcaRepository.findAll();
		for (Marca m : existing) {
			if (normalize(m.getNome()).equals(normalized)) {
				throw new ResourceAlreadyExistsException("Brand name already exists");
			}
		}

		Marca Marca = new Marca();
		Marca.setNome(MarcaDTO.getName());

		return MarcaRepository.save(Marca);
	}

	public List<MarcaDTO> getAllBrands() {
		List<Marca> brands = MarcaRepository.findAll();
		List<MarcaDTO> brandsDTO = new ArrayList<>();

		for (Marca marca : brands) {
			MarcaDTO currentBrand = new MarcaDTO();
			currentBrand.setId(marca.getId());
			currentBrand.setBrandName(marca.getNome());
			brandsDTO.add(currentBrand);
		}
		return brandsDTO;
	}

	public List<CategoriaDTO> getAllCategories() {
		List<Categoria> categories = CategoriaRepository.findAll();
		List<CategoriaDTO> categoriesDTO = new ArrayList<>();

		for (Categoria categoria : categories) {
			CategoriaDTO currentCategory = new CategoriaDTO();
			currentCategory.setId(categoria.getId());
			currentCategory.setCategoryName(categoria.getNome());
			categoriesDTO.add(currentCategory);
		}
		return categoriesDTO;
	}

	public Page<ProdutoQuantidadeEstoqueDTO> getAllProducts(int page) {
		Pageable pageable = PageRequest.of(page, 10, Sort.by("nome").ascending());
		return ProdutoRepository.findAllWithStock(pageable);
	}

	public Page<ProdutoQuantidadeEstoqueDTO> searchProductsWithStock(String query, int page) {
		String termo = (query == null) ? "" : query.trim();
		Pageable pageable = PageRequest.of(page, 10, Sort.by("nome").ascending());

		if (termo.length() < 2) {
			return Page.empty(pageable);
		}

		return ProdutoRepository.searchProductsWithStock(termo, pageable);
	}

	public Produto updateProduct(Long id, ProdutoCreateDTO productDTO) {
		Produto produto = ProdutoRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		String code = productDTO.getCode();
		if (code == null || !code.matches("^[A-Za-z0-9]{6}$")) {
			throw new BusinessException("Product code must be exactly 6 alphanumeric characters");
		}

		if (!code.equals(produto.getCodigo()) && ProdutoRepository.existsByCodigo(code)) {
			throw new ResourceAlreadyExistsException("Product code already exists");
		}

		Categoria categoria = CategoriaRepository.findById(productDTO.getCategoryId())
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));

		Marca marca = MarcaRepository.findById(productDTO.getBrandId())
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

		produto.setNome(productDTO.getName());
		produto.setUnidadeMedida(productDTO.getUnitMeasurement());
		produto.setCodigo(code);
		produto.setPerecivel(productDTO.getPerecivel());
		produto.setPrecoVenda(productDTO.getPrecoVenda());
		produto.setCategoria(categoria);
		produto.setMarca(marca);

		return ProdutoRepository.save(produto);
	}

	public void deleteProduct(Long id) {
		Produto produto = ProdutoRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));

		boolean used = MovimentacaoRepository.existsByProdutoId(id);
		if (used) {
			throw new BusinessException("Product is linked to movimentacoes and cannot be deleted");
		}

		ProdutoRepository.delete(produto);
	}

	public Categoria updateCategory(Long id, CategoriaCreateDTO CategoriaDTO) {
		Categoria categoria = CategoriaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));

		String normalized = normalize(CategoriaDTO.getName());
		List<Categoria> existing = CategoriaRepository.findAll();
		for (Categoria c : existing) {
			if (!c.getId().equals(id) && normalize(c.getNome()).equals(normalized)) {
				throw new ResourceAlreadyExistsException("Category name already exists");
			}
		}

		categoria.setNome(CategoriaDTO.getName());
		return CategoriaRepository.save(categoria);
	}

	public Marca updateBrand(Long id, MarcaCreateDTO MarcaDTO) {
		Marca marca = MarcaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

		String normalized = normalize(MarcaDTO.getName());
		List<Marca> existing = MarcaRepository.findAll();
		for (Marca m : existing) {
			if (!m.getId().equals(id) && normalize(m.getNome()).equals(normalized)) {
				throw new ResourceAlreadyExistsException("Brand name already exists");
			}
		}

		marca.setNome(MarcaDTO.getName());
		return MarcaRepository.save(marca);
	}

	public void deleteCategory(Long id) {
		Categoria categoria = CategoriaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found"));

		boolean used = ProdutoRepository.findAll().stream().anyMatch(p ->
				p.getCategoria() != null && p.getCategoria().getId().equals(id));
		if (used) {
			throw new BusinessException("Category is linked to products and cannot be deleted");
		}

		CategoriaRepository.delete(categoria);
	}

	public void deleteBrand(Long id) {
		Marca marca = MarcaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

		boolean used = ProdutoRepository.findAll().stream().anyMatch(p ->
				p.getMarca() != null && p.getMarca().getId().equals(id));
		if (used) {
			throw new BusinessException("Brand is linked to products and cannot be deleted");
		}

		MarcaRepository.delete(marca);
	}

	private String normalize(String input) {
		if (input == null) return "";
		String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
		normalized = normalized.replaceAll("\\p{M}", "");
		return normalized.toLowerCase().trim();
	}
}



