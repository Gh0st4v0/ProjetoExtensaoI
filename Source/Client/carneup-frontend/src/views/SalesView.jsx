import styled from 'styled-components'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Sidebar } from '../components/Sidebar'
import productsApi from '../services/productsApi'
import salesApi from '../services/salesApi'
import { toast } from 'react-toastify'

// ── Layout ─────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
	display: flex;
	height: 100vh;
	overflow: hidden;
	background: #f1f0ef;
	font-family: 'Work Sans', sans-serif;
	color: #1c1917;
`
const PdvArea = styled.div`
	flex: 1;
	display: flex;
	overflow: hidden;
	min-width: 0;
`

// ── Painel esquerdo — lista de produtos ────────────────────────────────────────

const ProductPanel = styled.section`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	background: #fafaf9;
`
const PanelHeader = styled.div`
	padding: 16px 20px;
	background: #fff;
	border-bottom: 1px solid #e7e5e4;
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex-shrink: 0;
`
const HeaderTop = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	h1 {
		font-family: 'Epilogue', sans-serif;
		font-size: 18px;
		font-weight: 900;
		text-transform: uppercase;
		color: #610005;
		margin: 0;
		letter-spacing: -0.02em;
	}
`
const BackBtn = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	color: #78716c;
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	padding: 4px 8px;
	border-radius: 6px;
	&:hover { background: #f5f5f4; color: #1c1917; }
`
const SearchBar = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	background: #f5f5f4;
	border-radius: 8px;
	padding: 8px 12px;
	border: 1px solid transparent;
	&:focus-within { border-color: #610005; background: #fff; }
	input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 14px;
		font-family: 'Work Sans', sans-serif;
		outline: none;
		color: #1c1917;
		&::placeholder { color: #a8a29e; }
	}
	span { color: #a8a29e; font-size: 20px; }
`
const CategoryTabs = styled.div`
	display: flex;
	gap: 6px;
	overflow-x: auto;
	&::-webkit-scrollbar { display: none; }
`
const Tab = styled.button`
	padding: 6px 14px;
	border-radius: 999px;
	border: 1px solid ${p => p.$active ? '#610005' : '#e7e5e4'};
	background: ${p => p.$active ? '#610005' : '#fff'};
	color: ${p => p.$active ? '#fff' : '#44403c'};
	font-size: 12px;
	font-weight: 700;
	font-family: 'Epilogue', sans-serif;
	white-space: nowrap;
	cursor: pointer;
	transition: all 0.15s;
	&:hover { border-color: #610005; color: ${p => p.$active ? '#fff' : '#610005'}; }
`
const ProductList = styled.div`
	flex: 1;
	overflow-y: auto;
	&::-webkit-scrollbar { width: 5px; }
	&::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 4px; }
`
const ProductRow = styled.div`
	border-bottom: 1px solid #f0eeec;
	background: ${p => p.$selected ? '#fff8f8' : '#fff'};
	transition: background 0.1s;
	cursor: pointer;
	&:hover { background: #fef2f2; }
`
const RowMain = styled.div`
	display: grid;
	grid-template-columns: 1fr auto auto auto;
	align-items: center;
	gap: 12px;
	padding: 12px 20px;
`
const ProductName = styled.div`
	min-width: 0;
	.name { font-weight: 700; font-size: 14px; color: #1c1917; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.sub { font-size: 11px; color: #a8a29e; margin-top: 1px; }
`
const CatBadge = styled.span`
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	padding: 2px 8px;
	border-radius: 999px;
	background: #ffdad6;
	color: #610005;
	white-space: nowrap;
`
const UnitTag = styled.span`
	font-size: 11px;
	font-weight: 700;
	color: #78716c;
	background: #f5f5f4;
	padding: 2px 8px;
	border-radius: 6px;
`
const PriceTag = styled.span`
	font-family: 'Epilogue', sans-serif;
	font-size: 15px;
	font-weight: 900;
	color: #610005;
	white-space: nowrap;
`
const AddInline = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 20px 12px;
	background: #fff8f8;
	border-top: 1px dashed #ffdad6;
`
const InlineInput = styled.input`
	width: 90px;
	padding: 7px 10px;
	border: 1px solid #e7e5e4;
	border-radius: 6px;
	font-size: 14px;
	font-family: 'Work Sans', sans-serif;
	text-align: center;
	&:focus { outline: none; border-color: #610005; }
`
const InlineLabel = styled.span`
	font-size: 11px;
	font-weight: 700;
	color: #78716c;
	text-transform: uppercase;
`
const AddBtn = styled.button`
	padding: 7px 16px;
	background: #610005;
	color: #fff;
	border: none;
	border-radius: 6px;
	font-weight: 700;
	font-size: 13px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 4px;
	&:hover { background: #7f1d1d; }
`
const CancelBtn = styled.button`
	padding: 7px 12px;
	border: 1px solid #e7e5e4;
	background: #fff;
	border-radius: 6px;
	font-size: 13px;
	cursor: pointer;
	color: #78716c;
	&:hover { background: #f5f5f4; }
`
const EmptyMsg = styled.div`
	padding: 48px 24px;
	text-align: center;
	color: #a8a29e;
	font-size: 14px;
`
const CountChip = styled.div`
	font-size: 12px;
	color: #78716c;
	padding: 10px 20px;
	background: #f5f5f4;
	border-bottom: 1px solid #e7e5e4;
	font-weight: 600;
`

// ── Painel direito — carrinho ──────────────────────────────────────────────────

const CartPanel = styled.aside`
	width: 360px;
	min-width: 300px;
	background: #fff;
	border-left: 1px solid #e7e5e4;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	@media (max-width: 900px) { width: 300px; }
`
const CartHead = styled.div`
	padding: 16px 20px;
	border-bottom: 1px solid #f5f5f4;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;
	h2 { font-family: 'Epilogue', sans-serif; font-size: 16px; font-weight: 900; text-transform: uppercase; color: #1c1917; margin: 0; }
	span.count { font-size: 11px; color: #78716c; font-weight: 600; }
`
const ClearBtn = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	color: #d6d3d1;
	display: flex;
	align-items: center;
	&:hover { color: #dc2626; }
`
const CartItems = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 8px 0;
	&::-webkit-scrollbar { width: 4px; }
	&::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 4px; }
`
const CartItemRow = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 10px 16px;
	border-bottom: 1px solid #f5f5f4;
	&:hover { background: #fafaf9; }
`
const ItemIcon = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 6px;
	background: #ffdad6;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	span { color: #610005; font-size: 16px; }
`
const ItemInfo = styled.div`
	flex: 1;
	min-width: 0;
	.name { font-weight: 700; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.detail { font-size: 11px; color: #78716c; margin-top: 2px; }
`
const ItemRight = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
	flex-shrink: 0;
`
const ItemTotal = styled.span`
	font-family: 'Epilogue', sans-serif;
	font-weight: 900;
	font-size: 14px;
	color: #1c1917;
`
const ItemControls = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	button {
		width: 24px; height: 24px;
		border-radius: 4px;
		border: 1px solid #e7e5e4;
		background: #fff;
		cursor: pointer;
		display: flex; align-items: center; justify-content: center;
		color: #57534e;
		span { font-size: 14px; }
		&:hover { background: #f5f5f4; }
	}
`
const QtyInput = styled.input`
	width: 48px;
	text-align: center;
	border: 1px solid #e7e5e4;
	border-radius: 4px;
	padding: 2px 4px;
	font-size: 12px;
	font-family: 'Work Sans', sans-serif;
	&:focus { outline: none; border-color: #610005; }
`
const RemoveBtn = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	color: #d6d3d1;
	padding: 0;
	display: flex;
	align-items: center;
	&:hover { color: #dc2626; }
	span { font-size: 16px; }
`
const CartFooter = styled.div`
	padding: 16px;
	border-top: 2px solid #f5f5f4;
	display: flex;
	flex-direction: column;
	gap: 12px;
	flex-shrink: 0;
`
const TotalBox = styled.div`
	background: #1c1917;
	border-radius: 10px;
	padding: 16px 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	.label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a8a29e; }
	.value { font-family: 'Epilogue', sans-serif; font-size: 32px; font-weight: 900; color: #fff; }
`
const PaySection = styled.div`
	p.title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #a8a29e; margin: 0 0 8px; }
	.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
`
const PayBtn = styled.button`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8px 4px;
	border-radius: 8px;
	border: 2px solid ${p => p.$active ? '#610005' : '#e7e5e4'};
	background: ${p => p.$active ? '#fef2f2' : '#fff'};
	cursor: pointer;
	transition: all 0.15s;
	&:hover { border-color: #610005; }
	span.icon { font-size: 22px; color: ${p => p.$active ? '#610005' : '#a8a29e'}; }
	span.text { font-size: 9px; font-weight: 900; text-transform: uppercase; color: ${p => p.$active ? '#610005' : '#1c1917'}; margin-top: 2px; letter-spacing: 0.05em; }
`
const FinalizeBtn = styled.button`
	width: 100%;
	padding: 16px;
	background: ${p => p.$empty ? '#e7e5e4' : '#610005'};
	color: ${p => p.$empty ? '#a8a29e' : '#fff'};
	border: none;
	border-radius: 10px;
	font-family: 'Epilogue', sans-serif;
	font-size: 15px;
	font-weight: 900;
	text-transform: uppercase;
	letter-spacing: 0.2em;
	cursor: ${p => p.$empty ? 'not-allowed' : 'pointer'};
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8px;
	transition: all 0.2s;
	&:hover:not(:disabled) { filter: brightness(1.08); }
`

// ── Success overlay ────────────────────────────────────────────────────────────

const Overlay = styled.div`
	position: fixed; inset: 0;
	background: rgba(0,0,0,0.5);
	display: flex; align-items: center; justify-content: center;
	z-index: 100;
`
const SuccessCard = styled.div`
	background: #fff;
	border-radius: 20px;
	padding: 48px 40px;
	text-align: center;
	max-width: 400px;
	width: 90%;
	.icon { font-size: 64px; color: #15803d; margin-bottom: 16px; }
	h2 { font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 28px; color: #1c1917; margin: 0 0 8px; }
	p { color: #78716c; margin: 0 0 24px; }
	button { padding: 14px 32px; background: #610005; color: #fff; border: none; border-radius: 10px; font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 14px; cursor: pointer; }
`

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

const PAYMENT_OPTIONS = [
	{ id: 'PIX', label: 'PIX', icon: 'qr_code' },
	{ id: 'DINHEIRO', label: 'Dinheiro', icon: 'payments' },
	{ id: 'CREDITO', label: 'Crédito', icon: 'credit_card' },
	{ id: 'DEBITO', label: 'Débito', icon: 'contactless' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export const SalesView = ({ navigate }) => {
	const [products, setProducts] = useState([])
	const [loadingProducts, setLoadingProducts] = useState(true)
	const [search, setSearch] = useState('')
	const [activeCategory, setActiveCategory] = useState('TODOS')
	const [cart, setCart] = useState([])
	const [payment, setPayment] = useState('DINHEIRO')
	const [selectedId, setSelectedId] = useState(null)
	const [inlineQty, setInlineQty] = useState('')
	const [inlinePrice, setInlinePrice] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [successSale, setSuccessSale] = useState(null)
	const searchRef = useRef(null)
	const qtyRef = useRef(null)

	// Load products
	useEffect(() => {
		setLoadingProducts(true)
		productsApi.getAllProducts(0)
			.then(data => setProducts((data.content || []).map(p => ({
				id: p.id,
				name: p.name || '',
				code: p.code || '',
				brand: p.brandName || '',
				category: p.categoryName || '',
				unit: p.unitMeasurement || 'UN',
				price: Number(p.precoVenda || 0),
			}))))
			.catch(() => toast.error('Erro ao carregar produtos.'))
			.finally(() => setLoadingProducts(false))
	}, [])

	// Focus search on mount
	useEffect(() => { searchRef.current?.focus() }, [])

	// Focus qty input when a product is selected
	useEffect(() => {
		if (selectedId) setTimeout(() => qtyRef.current?.focus(), 50)
	}, [selectedId])

	// Categories
	const categories = useMemo(() => {
		const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
		return ['TODOS', ...cats.sort()]
	}, [products])

	// Filtered list
	const displayed = useMemo(() => {
		let list = products
		if (activeCategory !== 'TODOS') list = list.filter(p => p.category === activeCategory)
		const q = search.trim().toLowerCase()
		if (q.length >= 1) list = list.filter(p =>
			p.name.toLowerCase().includes(q) ||
			p.code.toLowerCase().includes(q) ||
			p.brand.toLowerCase().includes(q)
		)
		return list
	}, [products, activeCategory, search])

	// Select product
	const selectProduct = (p) => {
		if (selectedId === p.id) { setSelectedId(null); return }
		setSelectedId(p.id)
		setInlineQty(p.unit === 'UN' ? '1' : '0.500')
		setInlinePrice(p.price > 0 ? String(p.price) : '')
	}

	// Add to cart
	const addToCart = (p) => {
		const qty = parseFloat(String(inlineQty).replace(',', '.'))
		if (!qty || qty <= 0) { toast.warning('Informe uma quantidade válida.'); return }
		if (p.unit === 'UN' && !Number.isInteger(qty)) { toast.warning('Quantidade deve ser inteira para UN.'); return }
		const price = parseFloat(String(inlinePrice).replace(',', '.'))
		if (isNaN(price) || price < 0) { toast.warning('Informe um preço válido.'); return }
		setCart(prev => [...prev, {
			key: Date.now(),
			productId: p.id,
			name: p.name,
			unit: p.unit,
			qty,
			price,
		}])
		setSelectedId(null)
		setInlineQty('')
		setInlinePrice('')
		searchRef.current?.focus()
	}

	// Cart operations
	const updateCartQty = (key, val) => {
		const q = parseFloat(String(val).replace(',', '.'))
		if (isNaN(q) || q <= 0) { removeFromCart(key); return }
		setCart(prev => prev.map(it => it.key === key ? { ...it, qty: q } : it))
	}
	const removeFromCart = (key) => setCart(prev => prev.filter(it => it.key !== key))
	const clearCart = () => { setCart([]); setSelectedId(null) }

	const total = cart.reduce((s, it) => s + it.qty * it.price, 0)

	// Finalize sale
	const handleFinalize = async () => {
		if (!cart.length || submitting) return
		setSubmitting(true)
		try {
			await salesApi.createSale({
				paymentMethod: payment,
				discount: 0,
				items: cart.map(it => ({
					productId: it.productId,
					quantity: it.qty,
					precoUnitarioVenda: it.price,
				})),
			})
			setSuccessSale({ total, count: cart.length, payment })
			setCart([])
		} catch (e) {
			toast.error(e?.response?.data?.message || 'Erro ao finalizar venda.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='sales' />

			<PdvArea>
				{/* ── Produtos ── */}
				<ProductPanel>
					<PanelHeader>
						<HeaderTop>
							<h1>Ponto de Venda</h1>
							<BackBtn onClick={() => navigate('dashboard')}>
								<span className='material-symbols-outlined' style={{ fontSize: 16 }}>arrow_back</span>
								Voltar
							</BackBtn>
						</HeaderTop>

						<SearchBar>
							<span className='material-symbols-outlined'>search</span>
							<input
								ref={searchRef}
								placeholder='Buscar produto por nome, código ou marca...'
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
							{search && (
								<span className='material-symbols-outlined' style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setSearch('')}>close</span>
							)}
						</SearchBar>

						<CategoryTabs>
							{categories.map(cat => (
								<Tab key={cat} $active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
									{cat}
								</Tab>
							))}
						</CategoryTabs>
					</PanelHeader>

					{!loadingProducts && (
						<CountChip>{displayed.length} produto{displayed.length !== 1 ? 's' : ''} encontrado{displayed.length !== 1 ? 's' : ''}</CountChip>
					)}

					<ProductList>
						{loadingProducts && <EmptyMsg>Carregando produtos...</EmptyMsg>}
						{!loadingProducts && displayed.length === 0 && (
							<EmptyMsg>Nenhum produto encontrado. Tente outro termo de busca.</EmptyMsg>
						)}
						{displayed.map(p => (
							<ProductRow key={p.id} $selected={selectedId === p.id}>
								<RowMain onClick={() => selectProduct(p)}>
									<ProductName>
										<div className='name'>{p.name}</div>
										<div className='sub'>{p.code} {p.brand ? `• ${p.brand}` : ''}</div>
									</ProductName>
									<CatBadge>{p.category || '—'}</CatBadge>
									<UnitTag>{p.unit}</UnitTag>
									<PriceTag>{fmt(p.price)}/{p.unit}</PriceTag>
								</RowMain>

								{selectedId === p.id && (
									<AddInline onClick={e => e.stopPropagation()}>
										<InlineLabel>Qtd</InlineLabel>
										<InlineInput
											ref={qtyRef}
											type='number'
											min='0'
											step={p.unit === 'UN' ? '1' : '0.001'}
											value={inlineQty}
											onChange={e => setInlineQty(e.target.value)}
											onKeyDown={e => e.key === 'Enter' && addToCart(p)}
										/>
										<InlineLabel>Preço R$</InlineLabel>
										<InlineInput
											type='number'
											min='0'
											step='0.01'
											value={inlinePrice}
											onChange={e => setInlinePrice(e.target.value)}
											onKeyDown={e => e.key === 'Enter' && addToCart(p)}
										/>
										<AddBtn onClick={() => addToCart(p)}>
											<span className='material-symbols-outlined' style={{ fontSize: 16 }}>add_shopping_cart</span>
											Adicionar
										</AddBtn>
										<CancelBtn onClick={() => setSelectedId(null)}>✕</CancelBtn>
									</AddInline>
								)}
							</ProductRow>
						))}
					</ProductList>
				</ProductPanel>

				{/* ── Carrinho ── */}
				<CartPanel>
					<CartHead>
						<div>
							<h2>Pedido</h2>
							<span className='count'>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
						</div>
						{cart.length > 0 && (
							<ClearBtn onClick={clearCart} title='Limpar carrinho'>
								<span className='material-symbols-outlined'>delete_sweep</span>
							</ClearBtn>
						)}
					</CartHead>

					<CartItems>
						{cart.length === 0 && (
							<EmptyMsg style={{ padding: '32px 16px' }}>
								<span className='material-symbols-outlined' style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>shopping_cart</span>
								Clique em um produto para adicionar ao pedido.
							</EmptyMsg>
						)}
						{cart.map(it => (
							<CartItemRow key={it.key}>
								<ItemIcon>
									<span className='material-symbols-outlined'>restaurant</span>
								</ItemIcon>
								<ItemInfo>
									<div className='name'>{it.name}</div>
									<div className='detail'>{fmt(it.price)}/{it.unit}</div>
								</ItemInfo>
								<ItemRight>
									<ItemTotal>{fmt(it.qty * it.price)}</ItemTotal>
									<ItemControls>
										<button onClick={() => updateCartQty(it.key, Math.max(0, it.qty - (it.unit === 'UN' ? 1 : 0.1)).toFixed(it.unit === 'UN' ? 0 : 3))}>
											<span className='material-symbols-outlined'>remove</span>
										</button>
										<QtyInput
											value={it.qty}
											onChange={e => updateCartQty(it.key, e.target.value)}
											type='number'
											min='0'
											step={it.unit === 'UN' ? '1' : '0.001'}
										/>
										<button onClick={() => updateCartQty(it.key, it.qty + (it.unit === 'UN' ? 1 : 0.1))}>
											<span className='material-symbols-outlined'>add</span>
										</button>
										<RemoveBtn onClick={() => removeFromCart(it.key)}>
											<span className='material-symbols-outlined'>close</span>
										</RemoveBtn>
									</ItemControls>
								</ItemRight>
							</CartItemRow>
						))}
					</CartItems>

					<CartFooter>
						<TotalBox>
							<span className='label'>Total</span>
							<span className='value'>{fmt(total)}</span>
						</TotalBox>

						<PaySection>
							<p className='title'>Pagamento</p>
							<div className='grid'>
								{PAYMENT_OPTIONS.map(opt => (
									<PayBtn key={opt.id} $active={payment === opt.id} onClick={() => setPayment(opt.id)}>
										<span className={`material-symbols-outlined icon${payment === opt.id ? ' fill' : ''}`}
											style={payment === opt.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
											{opt.icon}
										</span>
										<span className='text'>{opt.label}</span>
									</PayBtn>
								))}
							</div>
						</PaySection>

						<FinalizeBtn $empty={cart.length === 0} onClick={handleFinalize} disabled={cart.length === 0 || submitting}>
							<span className='material-symbols-outlined'>{submitting ? 'hourglass_empty' : 'check_circle'}</span>
							{submitting ? 'Processando...' : 'Finalizar Venda'}
						</FinalizeBtn>
					</CartFooter>
				</CartPanel>
			</PdvArea>

			{/* ── Overlay de sucesso ── */}
			{successSale && (
				<Overlay onClick={() => setSuccessSale(null)}>
					<SuccessCard onClick={e => e.stopPropagation()}>
						<span className='material-symbols-outlined icon' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
						<h2>Venda Concluída!</h2>
						<p>{successSale.count} item{successSale.count !== 1 ? 's' : ''} • {fmt(successSale.total)} • {successSale.payment}</p>
						<button onClick={() => setSuccessSale(null)}>Nova Venda</button>
					</SuccessCard>
				</Overlay>
			)}
		</Wrapper>
	)
}
