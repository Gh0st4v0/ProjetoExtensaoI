import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { StatsCard } from '../components/StatsCard'
import DataTable from '../components/DataTable'
import { ProductForm } from '../components/ProductForm'
import { StockForm } from '../components/StockForm'
import { Footer } from '../components/Footer'
import { Button } from '../components/Button'

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

// ==========================================
// MAIN COMPONENT
// ==========================================
export const StockView = ({ navigate }) => {
	const [stockItems, setStockItems] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [currentPage, setCurrentPage] = useState(1)

	// Mock data - replace with API call
	const mockData = [
		{
			id: 1,
			name: 'Ribeye Prime Cut',
			subtitle: 'Premium Aged',
			code: '#B-0922',
			brand: 'Angus Gold',
			category: 'Bovine',
			unit: 'Kg',
			stockQuantity: 124.5,
			stockStatus: 'normal',
		},
		{
			id: 2,
			name: 'Pork Belly Slab',
			subtitle: 'Skin-on',
			code: '#P-1288',
			brand: 'Duroc Heritage',
			category: 'Porcine',
			unit: 'Kg',
			stockQuantity: 12.2,
			stockStatus: 'low',
		},
		{
			id: 3,
			name: 'Chorizo Sausages',
			subtitle: 'Spicy Artisan',
			code: '#C-5541',
			brand: 'CarneUp Kitchen',
			category: 'Processed',
			unit: 'Un',
			stockQuantity: 450.0,
			stockStatus: 'normal',
		},
	]

	useEffect(() => {
		const fetchStockData = async () => {
			setIsLoading(true)
			try {
				// TODO: Replace with actual API call
				setTimeout(() => {
					setStockItems(mockData)
					setIsLoading(false)
				}, 1000)
			} catch (error) {
				console.error('Failed to fetch stock items:', error)
				setIsLoading(false)
			}
		}

		fetchStockData()
	}, [])

	const filteredItems = stockItems.filter((item) => {
		const query = searchQuery.toLowerCase()
		const name = item.name || ''
		const code = item.code || ''
		const brand = item.brand || ''
		const category = item.category || ''

		const matchesSearch =
			name.toLowerCase().includes(query) ||
			code.toLowerCase().includes(query) ||
			brand.toLowerCase().includes(query) ||
			category.toLowerCase().includes(query)

		const matchesCategory = !selectedCategory || category === selectedCategory

		return matchesSearch && matchesCategory
	})

	const totalItems = filteredItems.length
	const itemsPerPage = 10
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const handleProductSubmit = (formData) => {
		console.log('Novo produto:', formData)
		// TODO: Implement API call to create product
		alert('Produto cadastrado com sucesso!')
	}

	const handleStockSubmit = (formData) => {
		console.log('Entrada de estoque:', formData)
		// TODO: Implement API call to add stock
		alert('Estoque atualizado com sucesso!')
	}

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
						{item.stockQuantity.toFixed(2)} {item.unit}
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
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								flex: 1,
								maxWidth: '300px',
							}}
						>
							<span
								className='material-symbols-outlined'
								style={{ color: '#a8a29e' }}
							>
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
								<option value='Bovine'>Bovine</option>
								<option value='Porcine'>Porcine</option>
								<option value='Poultry'>Poultry</option>
								<option value='Lamb'>Lamb</option>
								<option value='Processed'>Processed</option>
							</select>
						</div>
					</div>

					<DataTable
						data={paginatedItems}
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
						<ProductForm onSubmit={handleProductSubmit} />
						<StockForm products={stockItems} onSubmit={handleStockSubmit} />
					</FormsGrid>
				</ContentContainer>

				<Footer />
			</MainArea>
		</Wrapper>
	)
}
