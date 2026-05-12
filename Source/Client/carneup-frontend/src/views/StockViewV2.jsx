import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { StatsCard } from '../components/StatsCard'
import DataTable from '../components/DataTable'
import { ProductForm } from '../components/ProductFormV2'
import productsApi from '../services/productsApi'
import { Footer } from '../components/Footer'
import { Button } from '../components/Button'
import { useAttributes } from '../context/AttributesContext'
import AlertModal from '../components/AlertModal'

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
	overflow-x: hidden;
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
		font-size: 28px;
		font-weight: 900;
		color: #610005;
		text-transform: uppercase;
	}

	p {
		color: #5a403c;
		font-size: 14px;
		margin-top: 4px;
	}
	.button-group {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
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

const TableTools = styled.div`
	background-color: #ffffff;
	border: 1px solid #eeeeee;
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
	padding: 16px;

	@media (min-width: 900px) {
		grid-template-columns: minmax(320px, 1fr) 260px;
		align-items: center;
	}

	.search-field {
		display: flex;
		align-items: center;
		gap: 10px;
		background-color: #f9f9f9;
		border: 1px solid #e7e5e4;
		border-radius: 4px;
		min-height: 44px;
		padding: 0 12px;
	}

	.filter-field {
		position: relative;
		min-height: 44px;
	}

	span {
		color: #8a040d;
		font-size: 20px;
		flex-shrink: 0;
	}

	input {
		width: 100%;
		border: none;
		background: transparent;
		outline: none;
		font-family: 'Work Sans', sans-serif;
		font-size: 13px;
		color: #1a1c1c;
	}

	.filter-trigger {
		width: 100%;
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 10px;
		border: 1px solid #e7e5e4;
		border-radius: 4px;
		background-color: #f9f9f9;
		padding: 0 12px;
		font-family: 'Work Sans', sans-serif;
		color: #1a1c1c;
		cursor: pointer;
	}

	.filter-trigger .filter-label {
		flex: 1;
		text-align: left;
		font-size: 13px;
		font-weight: 700;
		color: #1a1c1c;
	}

	.filter-trigger .chevron {
		font-size: 20px;
		color: #5a403c;
		transition: transform 0.18s;
	}

	.filter-trigger[aria-expanded='true'] .chevron {
		transform: rotate(180deg);
	}

	.filter-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: min(360px, 100%);
		max-height: 320px;
		overflow-y: auto;
		background: #ffffff;
		border: 1px solid #eeeeee;
		border-radius: 6px;
		box-shadow: 0 18px 40px rgba(26, 28, 28, 0.14);
		padding: 8px;
		z-index: 20;
	}

	.filter-group-label {
		padding: 10px 10px 6px;
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #8a040d;
	}

	.filter-option {
		width: 100%;
		min-height: 38px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #1a1c1c;
		font-family: 'Work Sans', sans-serif;
		font-size: 13px;
		font-weight: 700;
		text-align: left;
		padding: 9px 10px;
		cursor: pointer;
	}

	.filter-option:hover,
	.filter-option:focus-visible {
		background: #fff8f7;
		outline: none;
	}

	.filter-option.active {
		background: #ffdad6;
		color: #610005;
	}

	.filter-option .material-symbols-outlined {
		font-size: 18px;
		color: #610005;
	}

	.filter-option span:not(.material-symbols-outlined) {
		font-size: 13px;
		color: inherit;
	}

	input::placeholder {
		color: #8a7a76;
	}
`

const ProductFormSection = styled.div`
	max-width: 760px;
`

export const StockView = ({ navigate }) => {
	const { brands, categories, addBrand, addCategory } = useAttributes()

	const [searchPage, setSearchPage] = useState(null) // server-side page when searching
	const [stockItems, setStockItems] = useState([]) // items shown in table (mapped rows)
	const [stockByProduct, setStockByProduct] = useState({})
	const [inventorySummary, setInventorySummary] = useState({
		totalValue: 0,
		lowStockCount: 0,
		pendingDeliveries: 0,
		discardQuantity: 0,
	})
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [filterOpen, setFilterOpen] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [alertState, setAlertState] = useState({ open: false })

	const debounceRef = useRef(null)
	const filterRef = useRef(null)

	const showAlert = ({ title = 'Aviso', message, tone = 'info' }) => {
		setAlertState({ open: true, title, message, tone })
	}

	// --- helpers to map server DTOs to UI rows ---
	const buildStockMap = (items = []) => items.reduce((acc, item) => {
		const productId = item.id ?? item.productId
		if (productId == null) return acc

		const total = (item.purchases || []).reduce((sum, purchase) => {
			const quantity = Number(purchase.quantity ?? purchase.stockQuantity ?? 0)
			return sum + (Number.isFinite(quantity) ? quantity : 0)
		}, 0)

		acc[String(productId)] = total
		return acc
	}, {})

	const readStockQuantity = (p, stockMap = stockByProduct) => {
		const rawValue =
			p.stockQuantity ??
			p.quantidadeEstoque ??
			p.quantityInStock ??
			p.stock ??
			p.estoque ??
			p.quantidade

		if (rawValue != null) {
			const numericValue = Number(rawValue)
			return Number.isFinite(numericValue) ? numericValue : 0
		}

		const mappedQuantity = stockMap[String(p.id)]
		if (mappedQuantity != null) return mappedQuantity

		return 0
	}

	const readUnit = (p) => p.unitMeasurement || p.unidadeMedida || p.unit || p.unidade || ''
	const readSalePrice = (p) => {
		const rawValue = p.precoVenda ?? p.price ?? p.salePrice ?? p.valor ?? 0
		const numericValue = Number(rawValue)
		return Number.isFinite(numericValue) ? numericValue : 0
	}

	const normalizeText = (value) => String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()

	const readFilter = (value) => {
		const [type, ...rest] = String(value || '').split(':')
		return {
			type: rest.length ? type : 'category',
			value: rest.length ? rest.join(':') : value,
		}
	}

	const matchesSearchTerm = (item, term) => {
		const normalizedTerm = normalizeText(term)
		if (!normalizedTerm) return true

		return [item.name, item.code, item.brand, item.category]
			.some((field) => normalizeText(field).includes(normalizedTerm))
	}

	const matchesSelectedFilter = (item, filter) => {
		if (!filter) return true

		const { type, value } = readFilter(filter)
		const itemValue = type === 'brand' ? item.brand : item.category
		return normalizeText(itemValue) === normalizeText(value)
	}

	const applyLocalFilters = (items, term = searchQuery, filter = selectedCategory) => (
		items.filter((item) => matchesSearchTerm(item, term) && matchesSelectedFilter(item, filter))
	)

	const mapDtoToRow = (p, stockMap = stockByProduct) => {
		const stockQuantity = readStockQuantity(p, stockMap)
		const unit = readUnit(p)

		return {
			id: p.id,
			name: p.name,
			subtitle: '',
			code: p.code,
			brand: p.brandName || '',
			category: p.categoryName || p.category || '',
			unit,
			stockQuantity,
			stockStatus: stockQuantity < 5 ? 'low' : 'normal',
		}
	}

	const loadStockMap = async () => {
		try {
			const productsWithStock = await productsApi.getProductsWithPurchasesInStock()
			const nextMap = buildStockMap(productsWithStock || [])
			setStockByProduct(nextMap)
			return nextMap
		} catch (e) {
			console.error('Failed to load stock quantities', e)
			setStockByProduct({})
			return {}
		}
	}

	const calculateDiscardQuantity = (productsWithStock = []) => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return productsWithStock.reduce((total, product) => {
			return total + (product.purchases || []).reduce((sum, purchase) => {
				const expiringDate = purchase.expiring_date || purchase.expiringDate
				if (!expiringDate) return sum

				const expiration = new Date(`${expiringDate}T00:00:00`)
				if (expiration > today) return sum

				const quantity = Number(purchase.quantity ?? 0)
				return sum + (Number.isFinite(quantity) ? quantity : 0)
			}, 0)
		}, 0)
	}

	const loadInventorySummary = async (productsWithStock = null) => {
		try {
			const [allProducts, stockProducts] = await Promise.all([
				productsApi.getAllProductsList(),
				productsWithStock ? Promise.resolve(productsWithStock) : productsApi.getProductsWithPurchasesInStock(),
			])
			const nextStockMap = buildStockMap(stockProducts || [])
			const rows = (allProducts || []).map((product) => mapDtoToRow(product, nextStockMap))
			const totalValue = (allProducts || []).reduce((total, product) => {
				const stockQuantity = readStockQuantity(product, nextStockMap)
				return total + (stockQuantity * readSalePrice(product))
			}, 0)
			const lowStockCount = rows.filter((product) => product.stockQuantity > 0 && product.stockQuantity < 5).length
			const discardQuantity = calculateDiscardQuantity(stockProducts || [])

			setInventorySummary({
				totalValue,
				lowStockCount,
				pendingDeliveries: 0,
				discardQuantity,
			})
		} catch (e) {
			console.error('Failed to load inventory summary', e)
			setInventorySummary({
				totalValue: 0,
				lowStockCount: 0,
				pendingDeliveries: 0,
				discardQuantity: 0,
			})
		}
	}

	const loadProductsPage = async (pageIndex = 0, term = (searchQuery || '').trim()) => {
		setIsLoading(true)
		try {
			if (selectedCategory) {
				const [products, nextStockMap] = await Promise.all([
					productsApi.getAllProductsList(),
					loadStockMap(),
				])
				const rows = applyLocalFilters(
					(products || []).map((product) => mapDtoToRow(product, nextStockMap)),
					term,
					selectedCategory
				)

				setSearchPage({
					content: rows,
					totalElements: rows.length,
					totalPages: rows.length ? 1 : 0,
					number: 0,
				})
				setStockItems(rows)
				return
			}

			const [page, nextStockMap] = await Promise.all([
				term.length >= 2 ? productsApi.searchProducts(term, pageIndex) : productsApi.getAllProducts(pageIndex),
				loadStockMap(),
			])
			setSearchPage(page)
			setStockItems((page.content || []).map((product) => mapDtoToRow(product, nextStockMap)))
		} catch (e) {
			console.error('Failed to load products', e)
			setSearchPage({ content: [], totalElements: 0, totalPages: 0, number: 0 })
			setStockItems([])
		} finally {
			setIsLoading(false)
		}
	}

	// Fetch all products once for initial population (backend returns ProdutoResponseDTO)
	useEffect(() => {
		let mounted = true
		const load = async () => {
			setIsLoading(true)
			try {
				const [page, productsWithStock] = await Promise.all([
					productsApi.getAllProducts(0),
					productsApi.getProductsWithPurchasesInStock().catch((e) => {
						console.error('Failed to load stock quantities', e)
						return []
					}),
				])
				if (!mounted) return
				const nextStockMap = buildStockMap(productsWithStock || [])
				setStockByProduct(nextStockMap)
				loadInventorySummary(productsWithStock || [])
				setSearchPage(page)
				// initial page (server-side pagination)
				const initialSlice = (page.content || []).map((product) => mapDtoToRow(product, nextStockMap))
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
		if (selectedCategory) {
			await loadProductsPage(0, term)
			return
		}

		setIsLoading(true)
		try {
			const [page, nextStockMap] = await Promise.all([
				productsApi.searchProducts(term, pageIndex),
				loadStockMap(),
			])
			// page: { content, totalElements, totalPages, number }
			setSearchPage(page)
			const rows = (page.content || []).map((product) => mapDtoToRow(product, nextStockMap))
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
			debounceRef.current = setTimeout(() => loadProductsPage(0, term), 300)
		}
		return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
	}, [searchQuery, selectedCategory])

	const handleFilterChange = (value) => {
		setSelectedCategory(value)
		setCurrentPage(1)
		setFilterOpen(false)
	}

	useEffect(() => {
		const handlePointerDown = (event) => {
			if (!filterRef.current?.contains(event.target)) {
				setFilterOpen(false)
			}
		}

		document.addEventListener('mousedown', handlePointerDown)
		return () => document.removeEventListener('mousedown', handlePointerDown)
	}, [])

	const handlePageChange = async (page) => {
		setCurrentPage(page)
		const term = (searchQuery || '').trim()
		if (selectedCategory) {
			setCurrentPage(1)
			loadProductsPage(0, term)
			return
		}

		if (term.length >= 2) {
			performSearch(term, page - 1)
		} else {
			setIsLoading(true)
			try {
				const [pg, nextStockMap] = await Promise.all([
					productsApi.getAllProducts(page - 1),
					loadStockMap(),
				])
				setSearchPage(pg)
				const rows = (pg.content || []).map((product) => mapDtoToRow(product, nextStockMap))
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
			await productsApi.createProduct(payload)
			showAlert({
				title: 'Produto cadastrado',
				message: 'Produto cadastrado com sucesso!',
				tone: 'success',
			})
			setSearchQuery('')
			setCurrentPage(1)
			await loadInventorySummary()
			await loadProductsPage(0, '')
		} catch (e) {
			console.error('Erro ao criar produto', e)
			const msg = e.response?.data?.message || e.message || 'Falha ao cadastrar produto'
			showAlert({ title: 'Falha ao cadastrar', message: msg })
		}
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

	const formatQuantity = (value, unit) => {
		const numericValue = Number(value)
		const numeric = Number.isFinite(numericValue) ? numericValue : 0
		const isUnit = String(unit || '').toUpperCase() === 'UN'
		return numeric.toLocaleString('pt-BR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: isUnit ? 0 : 3,
		})
	}

	const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	})

	const formatSummaryQuantity = (value) => {
		const numericValue = Number(value)
		const numeric = Number.isFinite(numericValue) ? numericValue : 0
		return numeric.toLocaleString('pt-BR', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		})
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
				header: 'Qtd. em Estoque',
				key: 'stockQuantity',
				style: { textAlign: 'right' },
				render: (item) => (
					<div className='stock-indicator'>
						<p style={{ color: item.stockStatus === 'low' ? '#ba1a1a' : '#1a1c1c' }}>
							{formatQuantity(item.stockQuantity, item.unit)} {item.unit}
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
	const brandOptions = (brands || [])
		.map((brand) => brand.brandName || brand.name)
		.filter(Boolean)
	const categoryOptions = (categories || [])
		.map((category) => category.categoryName || category.name)
		.filter(Boolean)
	const selectedFilterLabel = selectedCategory ? readFilter(selectedCategory).value : 'Todos os produtos'

	const renderFilterOption = (value, label) => (
		<button
			key={value || 'all-products'}
			type='button'
			className={`filter-option ${selectedCategory === value ? 'active' : ''}`}
			onClick={() => handleFilterChange(value)}
		>
			<span>{label}</span>
			{selectedCategory === value && (
				<span className='material-symbols-outlined'>check</span>
			)}
		</button>
	)

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='stock' />

			<MainArea>
				<Topbar title='Gerenciamento de Estoque' />

				<ContentContainer>
					<PageHeader>
						<div>
							<h2>Gerenciamento de Estoque</h2>
							<p>Gerenciar produtos cadastrados, níveis de estoque e alertas.</p>
						</div>
						<div className='button-group'>
							<Button full={false} small onClick={() => navigate('stock')}>
								<span className='material-symbols-outlined' style={{ marginRight: 8 }}>add_box</span>
								Registrar Novo Produto
							</Button>
						</div>
					</PageHeader>
					<StatsGrid>
						<StatsCard
							label='Valor Total do Estoque'
							value={formatCurrency(inventorySummary.totalValue)}
							borderColor='#610005'
						/>
						<StatsCard
							label='Produtos com Poucas Unidades'
							value={`${inventorySummary.lowStockCount} Produtos`}
							borderColor='#ba1a1a'
							valueColor='#ba1a1a'
						/>
						<StatsCard
							label='Entregas Pendentes'
							value={`${inventorySummary.pendingDeliveries} Pedidos`}
							borderColor='#55656d'
						/>
						<StatsCard
							label='Itens para descarte'
							value={`${formatSummaryQuantity(inventorySummary.discardQuantity)} Unidades`}
							borderColor='#b32925'
						/>
					</StatsGrid>
					<TableTools>
						<label className='search-field'>
							<span className='material-symbols-outlined'>search</span>
							<input
								type='text'
								placeholder='Pesquisar por nome, código, marca ou categoria'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</label>
						<div className='filter-field' ref={filterRef}>
							<button
								type='button'
								className='filter-trigger'
								aria-expanded={filterOpen}
								onClick={() => setFilterOpen(prev => !prev)}
							>
								<span className='material-symbols-outlined'>filter_alt</span>
								<span className='filter-label'>{selectedFilterLabel}</span>
								<span className='material-symbols-outlined chevron'>expand_more</span>
							</button>
							{filterOpen && (
								<div className='filter-menu'>
									{renderFilterOption('', 'Todos os produtos')}
									{categoryOptions.length > 0 && (
										<>
											<div className='filter-group-label'>Categorias</div>
											{categoryOptions.map(categoryName => renderFilterOption(`category:${categoryName}`, categoryName))}
										</>
									)}
									{brandOptions.length > 0 && (
										<>
											<div className='filter-group-label'>Marcas</div>
											{brandOptions.map(brandName => renderFilterOption(`brand:${brandName}`, brandName))}
										</>
									)}
								</div>
							)}
						</div>
					</TableTools>
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
						<ProductFormSection>
							<ProductForm onSubmit={handleProductSubmit} brands={brands} categories={categories} onQuickCreate={handleQuickCreate} />
						</ProductFormSection>
					</ContentContainer>
					<Footer />
				</MainArea>
				<AlertModal
					open={alertState.open}
					title={alertState.title}
					message={alertState.message}
					tone={alertState.tone}
					onClose={() => setAlertState({ open: false })}
				/>
			</Wrapper>
	)
}
