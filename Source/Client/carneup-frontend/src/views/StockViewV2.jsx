import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import { Footer } from '../components/Footer'
import productsApi from '../services/productsApi'
import { useAttributes } from '../context/AttributesContext'
import { toast } from 'react-toastify'
import { toTitleCase } from '../services/textUtils'

// ── Styled Components ──────────────────────────────────────────────────────────

const Wrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #f9f9f9;
	font-family: 'Work Sans', sans-serif;
	color: #1a1c1c;
`
const MainArea = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	overflow-x: hidden;
`
const Content = styled.div`
	padding: 24px 16px;
	width: 100%;
	max-width: 1400px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 24px;
	box-sizing: border-box;
	@media (min-width: 768px) { padding: 32px 24px; }
	@media (min-width: 1280px) { padding: 32px 40px; }
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
		font-size: clamp(22px, 4vw, 36px);
		font-weight: 900;
		color: #610005;
		text-transform: uppercase;
		letter-spacing: -0.03em;
		margin: 0;
	}
	p { color: #5a403c; font-size: 14px; margin: 4px 0 0; }
`
const BtnGroup = styled.div`
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
`
const StatsGrid = styled.div`
	display: grid;
	gap: 12px;
	grid-template-columns: 1fr 1fr;
	@media (min-width: 768px) { grid-template-columns: repeat(4, 1fr); }
`
const StatCard = styled.div`
	background: #fff;
	border-radius: 8px;
	padding: 16px 20px;
	border-left: 4px solid ${p => p.$color || '#610005'};
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	p.label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin: 0 0 6px; }
	p.value { font-size: clamp(18px, 3vw, 24px); font-weight: 900; font-family: 'Epilogue', sans-serif; color: ${p => p.$valueColor || '#1a1c1c'}; margin: 0; }
`
const FilterRow = styled.div`
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	align-items: center;
`
const FilterSelect = styled.select`
	padding: 8px 12px;
	border: 1px solid #e7e5e4;
	border-radius: 6px;
	font-size: 13px;
	font-family: 'Work Sans', sans-serif;
	background: #fff;
	min-width: 160px;
	flex-shrink: 0;
`
const SearchInput = styled.input`
	padding: 8px 12px;
	border: 1px solid #e7e5e4;
	border-radius: 6px;
	font-size: 13px;
	font-family: 'Work Sans', sans-serif;
	background: #fff;
	flex: 1;
	min-width: 180px;
	max-width: 320px;
`
const TableScroll = styled.div`
	overflow-x: auto;
	width: 100%;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.06);
`
const LayoutGrid = styled.div`
	display: grid;
	gap: 24px;
	grid-template-columns: 1fr;
	@media (min-width: 1024px) { grid-template-columns: 1fr 1fr; }
`
const FormCard = styled.div`
	background: #fff;
	border-radius: 12px;
	padding: 24px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`
const FormTitle = styled.h3`
	font-family: 'Epilogue', sans-serif;
	font-weight: 900;
	color: #610005;
	text-transform: uppercase;
	font-size: 16px;
	margin: 0 0 20px;
`
const Field = styled.div`margin-bottom: 14px;`
const Label = styled.label`
	font-size: 10px; font-weight: 700; text-transform: uppercase;
	letter-spacing: 0.1em; color: #5a403c; display: block; margin-bottom: 6px;
`
const Input = styled.input`
	width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
	border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
	box-sizing: border-box;
	&:focus { outline: none; border-color: #610005; }
`
const Select = styled.select`
	width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
	border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
	background: #fff;
`
const FormGrid2 = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
`
const SubmitBtn = styled.button`
	width: 100%; padding: 12px; background: #610005; color: #fff;
	border: none; border-radius: 8px; font-family: 'Epilogue', sans-serif;
	font-weight: 900; font-size: 14px; text-transform: uppercase;
	letter-spacing: 0.08em; cursor: pointer; margin-top: 8px;
	&:hover { background: #7f1d1d; }
	&:disabled { opacity: 0.6; cursor: not-allowed; }
`
const Badge = styled.span`
	display: inline-block; padding: 2px 8px; border-radius: 999px;
	font-size: 11px; font-weight: 700; background: #ffdad6; color: #610005;
`
const StockBadge = styled.span`
	font-weight: 700;
	color: ${p => p.$low ? '#ba1a1a' : '#15803d'};
`

// ── Helpers ────────────────────────────────────────────────────────────────────

const mapDto = (p) => ({
	id: p.id,
	name: p.name || '',
	code: p.code || '',
	brand: p.brandName || '',
	category: p.categoryName || '',
	unit: p.unitMeasurement || '',
	price: p.precoVenda != null ? Number(p.precoVenda) : null,
	stock: p.stockQuantity != null ? Number(p.stockQuantity) : 0,
})

// ── Component ──────────────────────────────────────────────────────────────────

export const StockView = ({ navigate }) => {
	const { brands, categories, addBrand, addCategory } = useAttributes()

	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(0)
	const [totalItems, setTotalItems] = useState(0)

	// product form state
	const [form, setForm] = useState({ name: '', code: '', unit: 'KG', perecivel: false, price: '', categoryId: '', brandId: '' })
	const [submitting, setSubmitting] = useState(false)

	const debounceRef = useRef(null)

	// ── Data loading ───────────────────────────────────────────────────────────

	const load = useCallback(async (query, page) => {
		setLoading(true)
		try {
			let data
			if (query && query.trim().length >= 2) {
				data = await productsApi.searchProducts(query.trim(), page)
			} else {
				data = await productsApi.getAllProducts(page)
			}
			const content = (data.content || []).map(mapDto)
			setRows(content)
			setTotalPages(data.totalPages || 0)
			setTotalItems(data.totalElements || 0)
		} catch (e) {
			toast.error('Erro ao carregar produtos.')
			setRows([])
		} finally {
			setLoading(false)
		}
	}, [])

	// Initial load
	useEffect(() => { load('', 0) }, [load])

	// Debounced search
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setCurrentPage(1)
			load(searchQuery, 0)
		}, 400)
		return () => clearTimeout(debounceRef.current)
	}, [searchQuery, load])

	const handlePageChange = (page) => {
		setCurrentPage(page)
		load(searchQuery, page - 1)
	}

	// ── Category filter (client-side) ──────────────────────────────────────────

	const filtered = selectedCategory
		? rows.filter(r => r.category === selectedCategory)
		: rows

	// ── Stats ──────────────────────────────────────────────────────────────────

	const lowStock = rows.filter(r => r.stock < 5).length
	const outOfStock = rows.filter(r => r.stock === 0).length

	// ── Product form ───────────────────────────────────────────────────────────

	const handleFormChange = (field) => (e) => {
		const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value
		const val = (field === 'name') ? toTitleCase(raw)
			: (field === 'code') ? raw.toUpperCase()
			: raw
		setForm(f => ({ ...f, [field]: val }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!form.name || !form.code || !form.categoryId || !form.brandId) {
			toast.error('Preencha todos os campos obrigatórios.')
			return
		}
		if (!/^[A-Za-z0-9]{6}$/.test(form.code)) {
			toast.error('O código deve ter exatamente 6 caracteres alfanuméricos.')
			return
		}
		setSubmitting(true)
		try {
			await productsApi.createProduct({
				name: form.name,
				unitMeasurement: form.unit,
				code: form.code.toUpperCase(),
				perecivel: form.perecivel,
				precoVenda: form.price !== '' ? parseFloat(form.price) : 0,
				categoryId: Number(form.categoryId),
				brandId: Number(form.brandId),
			})
			toast.success(`Produto "${form.name}" cadastrado com sucesso!`)
			setForm({ name: '', code: '', unit: 'KG', perecivel: false, price: '', categoryId: '', brandId: '' })
			setSearchQuery('')
			setCurrentPage(1)
			load('', 0)
		} catch (e) {
			toast.error(e.response?.data?.message || 'Erro ao cadastrar produto.')
		} finally {
			setSubmitting(false)
		}
	}

	// ── Table columns ──────────────────────────────────────────────────────────

	const columns = [
		{
			header: 'Produto',
			key: 'name',
			render: r => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<div style={{ width: 36, height: 36, background: '#ffdad6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
						<span className='material-symbols-outlined' style={{ color: '#610005', fontSize: 18 }}>restaurant</span>
					</div>
					<div>
						<div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
						<div style={{ fontSize: 11, color: '#78716c' }}>{r.code}</div>
					</div>
				</div>
			),
		},
		{ header: 'Categoria', key: 'category', render: r => <Badge>{r.category || '—'}</Badge> },
		{ header: 'Marca', key: 'brand', render: r => <span style={{ fontSize: 13 }}>{r.brand || '—'}</span> },
		{ header: 'Unid.', key: 'unit', render: r => <span style={{ fontSize: 13, fontWeight: 600 }}>{r.unit}</span> },
		{
			header: 'Preço Venda',
			key: 'price',
			style: { textAlign: 'right' },
			render: r => <span style={{ fontSize: 13, fontWeight: 700 }}>
				{r.price != null ? `R$ ${Number(r.price).toFixed(2).replace('.', ',')}` : '—'}
			</span>,
		},
		{
			header: 'Estoque',
			key: 'stock',
			style: { textAlign: 'right' },
			render: r => (
				<div style={{ textAlign: 'right' }}>
					<StockBadge $low={r.stock < 5}>{r.stock.toFixed(2)} {r.unit}</StockBadge>
					{r.stock < 5 && <div style={{ fontSize: 10, color: '#ba1a1a', fontWeight: 700 }}>BAIXO</div>}
				</div>
			),
		},
	]

	const actions = [
		{ icon: 'add_shopping_cart', onClick: () => navigate('purchases') },
	]

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='stock' />
			<MainArea>
				<Topbar searchQuery={''} onSearchChange={() => {}} />
				<Content>

					{/* Header */}
					<PageHeader>
						<div>
							<h2>Gerenciamento de Estoque</h2>
							<p>Cadastre produtos, visualize estoque e gerencie seu catálogo.</p>
						</div>
						<BtnGroup>
							<Button variant='secondary' full={false} small onClick={() => navigate('purchases')}>
								<span className='material-symbols-outlined' style={{ fontSize: 16, marginRight: 6 }}>add_shopping_cart</span>
								Entrada de Estoque
							</Button>
						</BtnGroup>
					</PageHeader>

					{/* Stats */}
					<StatsGrid>
						<StatCard $color='#610005'>
							<p className='label'>Total de Produtos</p>
							<p className='value'>{totalItems}</p>
						</StatCard>
						<StatCard $color='#ba1a1a' $valueColor={lowStock > 0 ? '#ba1a1a' : '#1a1c1c'}>
							<p className='label'>Estoque Baixo (&lt;5)</p>
							<p className='value'>{lowStock}</p>
						</StatCard>
						<StatCard $color='#55656d' $valueColor={outOfStock > 0 ? '#ba1a1a' : '#1a1c1c'}>
							<p className='label'>Sem Estoque</p>
							<p className='value'>{outOfStock}</p>
						</StatCard>
						<StatCard $color='#15803d'>
							<p className='label'>Categorias</p>
							<p className='value'>{(categories || []).length}</p>
						</StatCard>
					</StatsGrid>

					{/* Filters */}
					<FilterRow>
						<span className='material-symbols-outlined' style={{ color: '#a8a29e', fontSize: 20 }}>search</span>
						<SearchInput
							placeholder='Buscar produto (mín. 2 caracteres)...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
						<span className='material-symbols-outlined' style={{ color: '#a8a29e', fontSize: 20 }}>filter_alt</span>
						<FilterSelect value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
							<option value=''>Todas as Categorias</option>
							{(categories || []).map(c => (
								<option key={c.id} value={c.categoryName}>{c.categoryName}</option>
							))}
						</FilterSelect>
						{(searchQuery || selectedCategory) && (
							<Button variant='secondary' full={false} small onClick={() => { setSearchQuery(''); setSelectedCategory('') }}>
								Limpar filtros
							</Button>
						)}
					</FilterRow>

					{/* Table */}
					<TableScroll>
						<DataTable
							data={filtered}
							columns={columns}
							actions={actions}
							toolbarActions={null}
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={selectedCategory ? filtered.length : totalItems}
							onPageChange={handlePageChange}
							loading={loading}
							emptyMessage='Nenhum produto encontrado.'
						/>
					</TableScroll>

					{/* Forms */}
					<LayoutGrid>
						{/* Cadastrar Produto */}
						<FormCard>
							<FormTitle>Cadastrar Novo Produto</FormTitle>
							<form onSubmit={handleSubmit}>
								<Field>
									<Label>Nome do Produto *</Label>
									<Input value={form.name} onChange={handleFormChange('name')} placeholder='Ex: Picanha Maturada' required />
								</Field>
								<FormGrid2>
									<Field>
										<Label>Código (6 caracteres) *</Label>
										<Input value={form.code} onChange={handleFormChange('code')} placeholder='ABC123' maxLength={6} required />
									</Field>
									<Field>
										<Label>Unidade *</Label>
										<Select value={form.unit} onChange={handleFormChange('unit')}>
											<option value='KG'>KG — Quilograma</option>
											<option value='UN'>UN — Unidade</option>
										</Select>
									</Field>
								</FormGrid2>
								<FormGrid2>
									<Field>
										<Label>Categoria *</Label>
										<Select value={form.categoryId} onChange={handleFormChange('categoryId')} required>
											<option value=''>Selecione...</option>
											{(categories || []).map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
										</Select>
									</Field>
									<Field>
										<Label>Marca *</Label>
										<Select value={form.brandId} onChange={handleFormChange('brandId')} required>
											<option value=''>Selecione...</option>
											{(brands || []).map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
										</Select>
									</Field>
								</FormGrid2>
								<FormGrid2>
									<Field>
										<Label>Preço de Venda (R$)</Label>
										<Input type='number' step='0.01' min='0' value={form.price} onChange={handleFormChange('price')} placeholder='0,00' />
									</Field>
									<Field>
										<Label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
											<input type='checkbox' checked={form.perecivel} onChange={handleFormChange('perecivel')} style={{ width: 16, height: 16, accentColor: '#610005' }} />
											Produto Perecível
										</Label>
									</Field>
								</FormGrid2>
								<SubmitBtn type='submit' disabled={submitting}>
									{submitting ? 'Cadastrando...' : 'Cadastrar Produto'}
								</SubmitBtn>
							</form>
						</FormCard>

						{/* Info / Dica */}
						<FormCard style={{ background: '#1a1c1c', color: '#fff' }}>
							<FormTitle style={{ color: '#ff9085' }}>Dicas de Uso</FormTitle>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
								{[
									{ icon: 'inventory_2', title: 'Entrada de Estoque', text: 'Use "Entrada de Estoque" para registrar compras de produtos já cadastrados.' },
									{ icon: 'manage_search', title: 'Busca', text: 'Digite pelo menos 2 caracteres para buscar produtos pelo nome.' },
									{ icon: 'label', title: 'Código', text: 'O código deve ter exatamente 6 caracteres alfanuméricos (A-Z, 0-9).' },
									{ icon: 'category', title: 'Atributos', text: 'Cadastre marcas e categorias em "Atributos" antes de criar produtos.' },
								].map(d => (
									<div key={d.icon} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
										<span className='material-symbols-outlined' style={{ color: '#ff9085', fontSize: 20, flexShrink: 0, marginTop: 2 }}>{d.icon}</span>
										<div>
											<div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{d.title}</div>
											<div style={{ fontSize: 12, color: '#a8a29e', lineHeight: 1.5 }}>{d.text}</div>
										</div>
									</div>
								))}
								<Button full={false} small onClick={() => navigate('attributes')} style={{ marginTop: 8 }}>
									Gerenciar Marcas e Categorias
								</Button>
							</div>
						</FormCard>
					</LayoutGrid>

				</Content>
				<Footer />
			</MainArea>
		</Wrapper>
	)
}
