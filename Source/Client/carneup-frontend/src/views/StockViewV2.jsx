import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { StatsCard } from '../components/StatsCard'
import DataTable from '../components/DataTable'
import { ProductForm } from '../components/ProductFormV2'
import productsApi from '../services/productsApi'
import { StockForm } from '../components/StockForm'
import { Footer } from '../components/Footer'
import { Button } from '../components/Button'
import { useAttributes } from '../context/AttributesContext'

// ==========================================
// STYLED COMPONENTS
// ==========================================
const Wrapper = styled.div`
	background-color: #f9f9f9;
	color: #1a1c1c;
	display: flex;
	min-height: 100vh;
	font-family: 'Work Sans', sans-serif;
`

const MainArea = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`

const ContentContainer = styled.div`
	padding: 32px;
	max-width: 1280px;
	margin: 0 auto;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 32px;
`

const PageHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	@media (min-width: 768px) {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-end;
	}

	h2 {
		font-family: 'Epilogue', sans-serif;
		font-size: 36px;
		font-weight: 900;
		color: #610005;
		text-transform: uppercase;
		letter-spacing: -0.05em;
	}
	p {
		color: #5a403c;
		font-size: 16px;
		margin-top: 4px;
	}
	.button-group {
		display: flex;
		gap: 8px;
	}
`

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
	@media (min-width: 768px) {
		grid-template-columns: repeat(4, 1fr);
	}
`

const FormsGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: 32px;
	@media (min-width: 1024px) {
		grid-template-columns: 1fr 1fr;
	}
`

const ITEMS_PER_PAGE = 10

export const StockView = ({ navigate }) => {
	const { brands, categories, addBrand, addCategory } = useAttributes()

	const [products, setProducts] = useState([]) // full list from /products (no stock)
	const [searchPage, setSearchPage] = useState(null) // server-side page when searching
	const [stockItems, setStockItems] = useState([]) // items shown in table (mapped rows)
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [currentPage, setCurrentPage] = useState(1)

	const debounceRef = useRef(null)

	// --- helpers to map server DTOs to UI rows ---
	const mapSearchDtoToRow = (p) => ({
		id: p.id,
		name: p.name,
		subtitle: '',
		code: p.code,
		brand: p.brandName || '',
		category: p.categoryName || '',
		unit: p.unitMeasurement || '',
		stockQuantity: p.stockQuantity != null ? Number(p.stockQuantity) : 0,
		stockStatus: (p.stockQuantity != null && Number(p.stockQuantity) < 5) ? 'low' : 'normal',
	})

	const mapProductDtoToRow = (p) => ({
		id: p.id,
		name: p.name,
		subtitle: '',
		code: p.code,
		brand: p.brandName || '',
		category: p.categoryName || p.category || '',
		unit: p.unitMeasurement || p.unidadeMedida || p.unit || '',
		stockQuantity: p.stockQuantity != null ? Number(p.stockQuantity) : 0,
		stockStatus: (p.stockQuantity != null && Number(p.stockQuantity) < 5) ? 'low' : 'normal',
	})

	// Fetch all products once for initial population (backend returns ProdutoResponseDTO)
	useEffect(() => {
		let mounted = true
		const load = async () => {
			setIsLoading(true)
			try {
				const page = await productsApi.getAllProducts(0)
				if (!mounted) return
				setSearchPage(page)
				// initial page (server-side pagination)
				const initialSlice = (page.content || []).map(mapProductDtoToRow)
				setStockItems(initialSlice)
			} catch (e) {
				console.error('Failed to load products', e)
			} finally {
				if (mounted) setIsLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	const performSearch = async (term, pageIndex = 0) => {
		setIsLoading(true)
		try {
			const page = await productsApi.searchProducts(term, pageIndex)
			// page: { content, totalElements, totalPages, number }
			setSearchPage(page)
			const rows = (page.content || []).map(mapSearchDtoToRow)
			setStockItems(rows)
		} catch (e) {
			console.error('Search failed', e)
			setSearchPage({ content: [], totalElements: 0, totalPages: 0, number: 0 })
			setStockItems([])
		} finally {
			setIsLoading(false)
		}
	}

	// Debounced search when user types
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		const term = (searchQuery || '').trim()
		if (term.length >= 2) {
			// reset to first page on new query
			setCurrentPage(1)
			debounceRef.current = setTimeout(() => performSearch(term, 0), 300)
		} else {
			// load first page for all products after debounce
			setCurrentPage(1)
			debounceRef.current = setTimeout(async () => {
				setIsLoading(true)
				try {
					const page = await productsApi.getAllProducts(0)
					setSearchPage(page)
					const rows = (page.content || []).map(mapProductDtoToRow)
					setStockItems(rows)
				} catch (e) {
					console.error('Failed to load products', e)
					setSearchPage({ content: [], totalElements: 0, totalPages: 0, number: 0 })
					setStockItems([])
				} finally {
					setIsLoading(false)
				}
			}, 300)
		}
		return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
	}, [searchQuery, products, selectedCategory])

	const handlePageChange = async (page) => {
		setCurrentPage(page)
		const term = (searchQuery || '').trim()
		if (term.length >= 2) {
			performSearch(term, page - 1)
		} else {
			setIsLoading(true)
			try {
				const pg = await productsApi.getAllProducts(page - 1)
				setSearchPage(pg)
				const rows = (pg.content || []).map(mapProductDtoToRow)
				setStockItems(rows)
			} catch (e) {
				console.error('Failed to load products', e)
				setSearchPage({ content: [], totalElements: 0, totalPages: 0, number: 0 })
				setStockItems([])
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleProductSubmit = async (formData) => {
		try {
			const payload = {
				name: formData.name,
				unitMeasurement: formData.unit,
				code: formData.code,
				perecivel: !!formData.perecivel,
				precoVenda: formData.price !== '' && formData.price !== null ? parseFloat(formData.price) : 0.0,
				categoryId: formData.categoryId ? Number(formData.categoryId) : null,
				brandId: formData.brandId ? Number(formData.brandId) : null,
			}
			const res = await productsApi.createProduct(payload)
			alert('Produto cadastrado com sucesso!')
			const created = res.data || {}
			// prepend created product to client-side list
			setProducts(prev => [created, ...prev])
			setStockItems(prev => [{ id: created.id || Date.now(), name: created.name || payload.name, subtitle: '', code: created.code || payload.code, brand: created.brandName || '', category: created.categoryName || '', unit: created.unitMeasurement || payload.unitMeasurement, stockQuantity: 0, stockStatus: 'normal' }, ...prev])
		} catch (e) {
			console.error('Erro ao criar produto', e)
			const msg = e.response?.data?.message || e.message || 'Falha ao cadastrar produto'
			alert(msg)
		}
	}

	const handleStockSubmit = (formData) => {
		console.log('Entrada de estoque:', formData)
		alert('Estoque atualizado com sucesso!')
	}

	const handleQuickCreate = async (type, value) => {
		try {
			if (type === 'brand') return await addBrand(value)
			else return await addCategory(value)
		} catch (e) {
			console.error('Falha ao criar atributo', e)
			return null
		}
	}

	// Columns remain same; stockQuantity may be 0 for items without stock info
	const tableColumns = [
		{
			header: 'Nome',
			key: 'name',
			render: (item) => (
				<div className='product-info'>
					<div className='product-icon'>
						<span className='material-symbols-outlined'>restaurant</span>
					</div>
					<div>
						<h4>{item.name}</h4>
						<p>{item.subtitle}</p>
					</div>
				</div>
			),
			},
			{
				header: 'Código',
				key: 'code',
				render: (item) => <span className='text-highlight'>{item.code}</span>,
			},
			{
				header: 'Marca',
				key: 'brand',
				render: (item) => <span className='text-highlight'>{item.brand}</span>,
			},
			{
				header: 'Categoria',
				key: 'category',
				render: (item) => <span className='category-badge'>{item.category}</span>,
			},
			{
				header: 'Unid',
				key: 'unit',
				render: (item) => <span className='text-highlight'>{item.unit}</span>,
			},
			{
				header: 'Quantidade em Estoque',
				key: 'stockQuantity',
				style: { textAlign: 'right' },
				render: (item) => (
					<div className='stock-indicator'>
						<p style={{ color: item.stockStatus === 'low' ? '#ba1a1a' : '#1a1c1c' }}>
							{(item.stockQuantity || 0).toFixed(2)} {item.unit}
						</p>
						<div className='progress-track'>
							<div
								className='progress-fill'
								style={{
									width: item.stockStatus === 'low' ? '15%' : '75%',
									backgroundColor:
										item.stockStatus === 'low' ? '#ba1a1a' : '#610005',
								}}
							/>
						</div>
					</div>
				),
			},
		]

	const tableActions = [
		{
			icon: 'edit',
			onClick: (item) => console.log('Editar:', item),
		},
		{
			icon: 'add_circle',
			onClick: (item) => console.log('Adicionar estoque:', item),
		},
	]

	const toolbarActions = (
		<>
			<Button variant='secondary' full={false} small>
				Exportar CSV
			</Button>
			<Button variant='secondary' full={false} small>
				Imprimir Etiquetas
			</Button>
		</>
	)

	const pg = searchPage || { totalElements: 0, totalPages: 0 }
	const totalItems = pg.totalElements || 0
	const totalPages = pg.totalPages || 0

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='stock' />

			<MainArea>
				<Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

				<ContentContainer>
					<PageHeader>
						<div>
							<h2>Gerenciamento de Estoque</h2>
							<p>
								Gerenciar cortes de primeira qualidade, níveis de estoque e
								purchases.
							</p>
						</div>
						<div className='button-group'>
							<Button variant='secondary' full={false} small onClick={() => navigate('purchases')}>
								<span className='material-symbols-outlined' style={{ marginRight: 8 }}>inventory</span>
								Adicionar ao Estoque
							</Button>
							<Button full={false} small onClick={() => navigate('stock')}>
								<span className='material-symbols-outlined' style={{ marginRight: 8 }}>add_box</span>
								Registrar Novo Produto
							</Button>
						</div>
					</PageHeader>
					<StatsGrid>
						<StatsCard
							label='Valor Total do Estoque'
							value='R$ 42.850,00'
							borderColor='#610005'
						/>
						<StatsCard
							label='Produtos com Poucas Unidades'
							value='12 Produtos'
							borderColor='#ba1a1a'
							valueColor='#ba1a1a'
						/>
						<StatsCard
							label='Entregas Pendentes'
							value='04 Pedidos'
							borderColor='#55656d'
						/>
						<StatsCard
							label='Items to Discard'
							value='02 Unidades'
							borderColor='#b32925'
						/>
					</StatsGrid>
					<div
						style={{
							display: 'flex',
							gap: '16px',
							alignItems: 'center',
							marginBottom: '16px',
						}}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								flex: 1,
								maxWidth: '300px',
							}}>
							<span
								className='material-symbols-outlined'
								style={{ color: '#a8a29e' }}>
									filter_alt
								</span>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									style={{
										flex: 1,
										padding: '8px 12px',
										border: '1px solid #e7e5e4',
										borderRadius: '4px',
										fontSize: '12px',
										fontFamily: 'Work Sans, sans-serif',
										textTransform: 'uppercase',
										letterSpacing: '0.1em',
									}}
								>
									<option value=''>Todas as Categorias</option>
									{(categories || []).map(c => (
										<option key={c.id} value={c.categoryName}>{c.categoryName}</option>
									))}
								</select>
							</div>
						</div>
						<DataTable
							data={stockItems}
							columns={tableColumns}
							actions={tableActions}
							toolbarActions={toolbarActions}
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							onPageChange={handlePageChange}
							loading={isLoading}
							emptyMessage='Nenhum produto em estoque.'
						/>
						<FormsGrid>
							<ProductForm onSubmit={handleProductSubmit} brands={brands} categories={categories} onQuickCreate={handleQuickCreate} />
							<StockForm products={stockItems} onSubmit={handleStockSubmit} />
						</FormsGrid>
					</ContentContainer>
					<Footer />
				</MainArea>
			</Wrapper>
	)
}
