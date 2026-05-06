import styled from 'styled-components'
import { useState, useEffect, useMemo } from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import productsApi from '../services/productsApi'
import salesApi from '../services/salesApi'

// Minimal SalesView: search bar at top + product list + cart sidebar




const Wrapper = styled.div`
	background-color: #f9f9f9;
	color: #1c1917;
	display: flex;
	height: 100vh;
	overflow: hidden;
	font-family: 'Work Sans', sans-serif;
`

const MainArea = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`



const ContentArea = styled.main`
	flex: 1;
	display: flex;
	overflow: hidden; /* Mantém o grid e o carrinho rolando independentemente */
`

// --- GRID DE PRODUTOS ---
const ProductSection = styled.section`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	background-color: #fafaf9;
`

const Categories = styled.div`
	padding: 24px;
	background-color: #ffffff;
	border-bottom: 1px solid #e7e5e4;
	display: flex;
	gap: 12px;
	overflow-x: auto;
	flex-shrink: 0;

	&::-webkit-scrollbar {
		display: none;
	}

	button {
		padding: 16px 32px;
		border-radius: 12px;
		font-family: 'Epilogue', sans-serif;
		font-size: 14px;
		font-weight: 900;
		border: none;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;

		&.active {
			background-color: #610005;
			color: #ffffff;
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		}
		&.inactive {
			background-color: #f5f5f4;
			color: #44403c;
			&:hover {
				background-color: #e7e5e4;
			}
		}
	}
`

const ProductGrid = styled.div`
	flex: 1;
	overflow-y: auto; /* Rolagem independente para os produtos */
	padding: 24px;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24px;
	align-content: flex-start;

	@media (min-width: 1280px) {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (min-width: 1536px) {
		grid-template-columns: repeat(4, 1fr);
	}

	&::-webkit-scrollbar {
		width: 6px;
	}
	&::-webkit-scrollbar-thumb {
		background-color: #d6d3d1;
		border-radius: 4px;
	}
`

const ProductCard = styled.button`
	background-color: #ffffff;
	border-radius: 12px;
	border: 1px solid #e7e5e4;
	overflow: hidden;
	text-align: left;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	transition: all 0.2s;
	padding: 0;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}
	&:active {
		transform: scale(0.98);
	}

	.img-wrapper {
		width: 100%;
		aspect-ratio: 16/10;
		overflow: hidden;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.info {
		padding: 20px;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}

	.category {
		font-size: 10px;
		font-family: 'Epilogue', sans-serif;
		font-weight: 900;
		color: #991b1b;
		text-transform: uppercase;
		display: block;
		margin-bottom: 4px;
	}
	h3 {
		font-family: 'Epilogue', sans-serif;
		font-size: 20px;
		font-weight: 800;
		text-transform: uppercase;
		line-height: 1.2;
		color: #1c1917;
	}

	.price-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 24px;
		width: 100%;
	}
	.price-label {
		font-size: 12px;
		font-family: 'Work Sans', sans-serif;
		font-weight: 700;
		color: #a8a29e;
	}
	.price {
		font-size: 30px;
		font-family: 'Epilogue', sans-serif;
		font-weight: 900;
		color: #610005;
	}
`

// --- CARRINHO LATERAL ---
const CartSidebar = styled.aside`
	width: 450px;
	background-color: #ffffff;
	border-left: 1px solid #e7e5e4;
	display: flex;
	flex-direction: column;
	z-index: 20;
	box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
	flex-shrink: 0;
`

const CartHeader = styled.div`
	padding: 24px;
	border-bottom: 1px solid #f5f5f4;
	background-color: rgba(250, 250, 249, 0.5);
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;

	h2 {
		font-family: 'Epilogue', sans-serif;
		font-size: 24px;
		font-weight: 900;
		text-transform: uppercase;
		color: #1c1917;
		letter-spacing: -0.05em;
	}
	p {
		font-size: 11px;
		font-family: 'Epilogue', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #78716c;
		font-weight: 700;
	}

	.delete-btn {
		background: none;
		border: none;
		color: #d6d3d1;
		cursor: pointer;
		transition: color 0.2s;
		&:hover {
			color: #dc2626;
		}
		span {
			font-size: 30px;
		}
	}
`

const CartItemsList = styled.div`
	flex: 1;
	overflow-y: auto; /* Rolagem independente para o carrinho */
	padding: 24px;
	display: flex;
	flex-direction: column;
	gap: 16px;

	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background-color: #e7e5e4;
		border-radius: 4px;
	}
`

const CartItem = styled.div`
	padding: 16px;
	background-color: #fafaf9;
	border-radius: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.details {
		h4 {
			font-family: 'Epilogue', sans-serif;
			font-size: 16px;
			font-weight: 900;
			text-transform: uppercase;
			color: #292524;
		}
		p {
			font-size: 14px;
			color: #78716c;
			font-weight: 700;
			margin-top: 4px;
		}
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		p.total {
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			font-size: 18px;
			color: #1c1917;
		}
		.controls {
			display: flex;
			gap: 8px;
			button {
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #ffffff;
				border: 1px solid #e7e5e4;
				border-radius: 6px;
				color: #57534e;
				cursor: pointer;
				&:hover {
					background-color: #f5f5f4;
				}
			}
		}
	}
`

const CartFooter = styled.div`
	padding: 24px;
	background-color: #ffffff;
	border-top: 2px solid #f5f5f4;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	gap: 24px;

	.total-box {
		background-color: #1c1917;
		padding: 24px;
		border-radius: 12px;
		color: #ffffff;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

		.label {
			font-size: 10px;
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			opacity: 0.6;
		}
		.discount {
			font-size: 10px;
			font-family: 'Epilogue', sans-serif;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			color: #f87171;
			margin-top: 4px;
		}
		.value {
			font-size: 48px;
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			line-height: 1;
		}
	}

	.payment-section {
		p.title {
			font-size: 10px;
			font-family: 'Epilogue', sans-serif;
			font-weight: 900;
			color: #a8a29e;
			text-transform: uppercase;
			letter-spacing: 0.2em;
			margin-bottom: 12px;
			margin-left: 4px;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}
	}

	.finalize-btn {
		width: 100%;
		padding: 24px;
		background-color: #610005;
		color: #ffffff;
		border-radius: 12px;
		font-family: 'Epilogue', sans-serif;
		font-size: 18px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		border: none;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		box-shadow: 0 10px 30px rgba(97, 0, 5, 0.3);
		transition: all 0.2s;

		&:hover {
			filter: brightness(1.1);
		}
		&:active {
			transform: scale(0.98);
		}
		span {
			font-size: 24px;
			transition: transform 0.2s;
		}
		&:hover span {
			transform: translateX(4px);
		}
	}
`

const PaymentButton = styled.button`
	aspect-ratio: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: ${(props) => (props.$active ? '#fef2f2' : '#ffffff')};
	border: 2px solid ${(props) => (props.$active ? '#610005' : '#e7e5e4')};
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: #610005;
		background-color: #fef2f2;
	}
	&:active {
		transform: scale(0.95);
	}

	span.icon {
		font-size: 30px;
		margin-bottom: 4px;
		color: ${(props) => (props.$active ? '#610005' : '#a8a29e')};
		transition: color 0.2s;
	}
	span.text {
		font-size: 10px;
		font-family: 'Epilogue', sans-serif;
		font-weight: 900;
		text-transform: uppercase;
		color: ${(props) => (props.$active ? '#610005' : '#1c1917')};
		transition: color 0.2s;
	}

	&:hover span.icon,
	&:hover span.text {
		color: #610005;
	}
`

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const SalesView = ({ navigate }) => {
	const [pagamentoSelecionado, setPagamentoSelecionado] = useState('dinheiro')
	const [searchQuery, setSearchQuery] = useState('')
	const [products, setProducts] = useState([])
	const [cart, setCart] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('TODOS')
	const [editingProductId, setEditingProductId] = useState(null)
	const [editingQty, setEditingQty] = useState('')
	const [editingPrice, setEditingPrice] = useState('')

	useEffect(() => {
		let mounted = true
		const load = async () => {
			try {
				const page = await productsApi.getAllProducts(0)
				if (!mounted) return
				const list = (page?.content || []).map(p => ({ id: p.id, name: p.name, code: p.code, brand: p.brandName || (p.brand && p.brand.name) || p.brand || p.marca || '', categoryName: p.categoryName || p.category, unit: p.unitMeasurement || p.unidadeMedida || p.unit, precoVenda: Number(p.precoVenda || p.price || p.precoUnitarioVenda || p.valor || p.salePrice || p.unitPrice || 0), image: p.imageUrl || p.image }))
				setProducts(list)
			} catch (e) {
				console.error('Failed to load products', e)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	const categories = useMemo(() => {
		const set = new Set((products || []).map(p => p.categoryName || p.category || 'OUTROS'))
		return ['TODOS', ...Array.from(set)]
	}, [products])

	const displayedProducts = useMemo(() => {
		let list = products || []
		if (selectedCategory && selectedCategory !== 'TODOS') {
			list = list.filter(p => (p.categoryName || p.category || '').toLowerCase() === selectedCategory.toLowerCase())
		}
		const q = (searchQuery || '').trim().toLowerCase()
		if (q.length >= 2) {
			list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q))
		}
		return list
	}, [products, selectedCategory, searchQuery])

	const handleProductClick = (p) => {
		// Toggle editing state for inline quantity entry
		if (editingProductId === p.id) {
			setEditingProductId(null)
			setEditingQty('')
			setEditingPrice('')
			return
		}
		const defaultQty = (p.unit || p.unitMeasurement) === 'UN' ? '1' : '0.5'
		setEditingProductId(p.id)
		setEditingQty(defaultQty)
		setEditingPrice((p.precoVenda || 0).toString())
	}

	const addToCartFromProduct = (p) => {
		const raw = (editingQty || '').toString().trim()
		if (!raw) return alert('Quantidade inválida')
		const parsed = Number(raw.replace(',', '.'))
		if (isNaN(parsed) || parsed <= 0) return alert('Quantidade inválida')
		const unit = p.unit || p.unitMeasurement || 'UN'
		if (unit === 'UN' && !Number.isInteger(parsed)) return alert('Quantidade deve ser inteira para UN')
		const priceRaw = (editingPrice || '').toString().trim()
		const price = priceRaw ? Number(priceRaw.replace(',', '.')) : (p.precoVenda || 0)
		if (isNaN(price) || price < 0) return alert('Preço inválido')
		const item = { id: Date.now(), productId: p.id, productName: p.name, qty: parsed, precoUnitarioVenda: price, unit, brand: p.brand || '' }
		setCart(prev => [item, ...prev])
		setEditingProductId(null)
		setEditingQty('')
		setEditingPrice('')
	}

	const cancelEditing = () => {
		setEditingProductId(null)
		setEditingQty('')
	}

	const updateQty = (id, newQty) => {
		setCart(prev => prev.map(it => it.id === id ? { ...it, qty: newQty } : it).filter(it => it.qty > 0))
	}

	const removeFromCart = (id) => setCart(prev => prev.filter(it => it.id !== id))

	const total = cart.reduce((s, it) => s + (Number(it.precoUnitarioVenda || it.price || 0) * Number(it.qty || 0)), 0)

	const handleFinalize = async () => {
		if (!cart.length) return alert('Carrinho vazio')
		const payload = {
			paymentMethod: pagamentoSelecionado,
			discount: 0,
			items: cart.map(it => ({ productId: Number(it.productId), quantity: Number(it.qty), precoUnitarioVenda: Number(it.precoUnitarioVenda || it.price || 0) }))
		}
		try {
			const res = await salesApi.createSale(payload)
			const saleId = res?.id || res?.saleId || res?.data?.id
			const discards = res?.discards || res?.data?.discards || []
			let msg = `Venda criada. ID: ${saleId || '(sem id retornado)'}`
			if (discards && discards.length) {
				msg += '\nDescartes aplicados:\n' + discards.map(d => `- ${d.productName || d.productId}: ${d.quantity} ${d.unit || ''}`).join('\n')
			}
			alert(msg)
			setCart([])
		} catch (e) {
			console.error('Erro ao criar venda', e)
			alert(e?.response?.data?.message || 'Falha ao criar venda')
		}
	}

	return (
			<Wrapper>
				<Sidebar navigate={navigate} activeView='sales' />

				<MainArea>
					<Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

					<ContentArea>
						<ProductSection>
							<ProductGrid>
							  {displayedProducts.length === 0 && <div style={{padding:16,color:'#777'}}>Nenhum produto encontrado.</div>}
							  {displayedProducts.map(p => (
								<ProductCard key={p.id} onClick={editingProductId === p.id ? undefined : () => handleProductClick(p)}>
								  <div className='info'>
									<div>
									  <span className='category'>{p.categoryName}</span>
									  <h3>{p.name}</h3>
									  <div style={{fontSize:12,color:'#6b6b6b',marginTop:6}}>{p.brand}</div>
										{editingProductId === p.id ? (
										<div style={{marginTop:12,display:'flex',gap:8,alignItems:'center'}} onClick={(e)=>e.stopPropagation()}>
											<div style={{display:'flex',flexDirection:'column',marginRight:8}}>
							<label style={{fontSize:11,marginBottom:6,fontWeight:700}}>Qtd</label>
							<input autoFocus type="number" min="0" step="0.01" value={editingQty} onChange={(e)=>setEditingQty(e.target.value.replace(',','.'))} onKeyDown={(e)=>{ if (e.key === 'Enter') { e.stopPropagation(); addToCartFromProduct(p) } }} style={{padding:8,borderRadius:8,border:'1px solid #e7e5e4',width:120}} />
						</div>
										<div style={{display:'flex',flexDirection:'column',marginRight:8}}>
							<label style={{fontSize:11,marginBottom:6,fontWeight:700}}>Preço R$</label>
							<input value={editingPrice} onChange={(e)=>setEditingPrice(e.target.value.replace(',','.'))} onKeyDown={(e)=>{ if (e.key === 'Enter') { e.stopPropagation(); addToCartFromProduct(p) } }} type="number" min="0" step="0.01" style={{padding:8,borderRadius:8,border:'1px solid #e7e5e4',width:120}} />
						</div>
											<button onClick={(e)=>{e.stopPropagation(); addToCartFromProduct(p)}} style={{padding:'10px 16px',background:'#610005',color:'#fff',border:'none',borderRadius:8}}>Adicionar</button>
											<button onClick={(e)=>{e.stopPropagation(); cancelEditing()}} style={{padding:'10px 12px',border:'1px solid #e7e5e4',background:'#fff',borderRadius:8}}>Cancelar</button>
										</div>
									) : (
										<div className='price-row'>
									  <span className='price-label'>R$ / {p.unit}</span>
									  <span className='price'>{(p.precoVenda || 0).toFixed(2)}</span>
									</div>
									)}
								</div>
							  </div>
							</ProductCard>
							  ))}
							</ProductGrid>
						</ProductSection>

						<CartSidebar>
							<CartHeader>
								<div>
									<h2>Pedido Atual</h2>
									<p>Mesa 04 • #88241</p>
								</div>
								<button className='delete-btn'>
									<span className='material-symbols-outlined'>delete_sweep</span>
								</button>
							</CartHeader>

							<CartItemsList>
								{cart.length === 0 && <div style={{padding:24,color:'#78716c'}}>Carrinho vazio.</div>}
								{cart.map((it) => (
									<CartItem key={it.id}>
										<div className='details'>
											<h4>{it.productName}</h4>
										<div style={{fontSize:12,color:'#6b6b6b'}}>{it.brand}</div>
											<p>{it.qty} {it.unit || ''} × R$ {Number(it.precoUnitarioVenda || it.price || 0).toFixed(2)}</p>
										</div>
										<div className='actions'>
											<p className='total'>R$ {(Number(it.precoUnitarioVenda || it.price || 0) * Number(it.qty || 0)).toFixed(2)}</p>
											<div className='controls'>
												<button onClick={() => updateQty(it.id, Math.max(0, (it.qty || 0) - 1))}>
												<span className='material-symbols-outlined'>remove</span>
												</button>
												<button onClick={() => updateQty(it.id, (it.qty || 0) + 1)}>
												<span className='material-symbols-outlined'>add</span>
												</button>
											</div>
											</div>
										</CartItem>
									))}
								</CartItemsList>

								<CartFooter>
									<div className='total-box'>
										<div>
											<p className='label'>Valor Total</p>
											<p className='discount'>Desconto: R$ 0,00</p>
										</div>
										<div className='value'>R$ {total.toFixed(2)}</div>
									</div>

									<div className='payment-section'>
										<p className='title'>Forma de Pagamento</p>
										<div className='grid'>
											<PaymentButton
												$active={pagamentoSelecionado === 'PIX'}
												onClick={() => setPagamentoSelecionado('PIX')}
											>
												<span className='material-symbols-outlined icon'>
													qr_code
												</span>
												<span className='text'>PIX</span>
											</PaymentButton>

											<PaymentButton
												$active={pagamentoSelecionado === 'DINHEIRO'}
												onClick={() => setPagamentoSelecionado('DINHEIRO')}
											>
												<span
													className='material-symbols-outlined icon'
													style={
														pagamentoSelecionado === 'DINHEIRO'
														? { fontVariationSettings: "'FILL' 1" }
														: {}
													}
											>
													payments
												</span>
												<span className='text'>Dinheiro</span>
											</PaymentButton>

											<PaymentButton
												$active={pagamentoSelecionado === 'CREDITO'}
												onClick={() => setPagamentoSelecionado('CREDITO')}
											>
												<span className='material-symbols-outlined icon'>
													credit_card
												</span>
												<span className='text'>Crédito</span>
											</PaymentButton>

											<PaymentButton
												$active={pagamentoSelecionado === 'DEBITO'}
												onClick={() => setPagamentoSelecionado('DEBITO')}
											>
												<span className='material-symbols-outlined icon'>
													contactless
												</span>
												<span className='text'>Débito</span>
											</PaymentButton>
										</div>
									</div>

									<button className='finalize-btn' onClick={handleFinalize}>
										Finalizar Venda
										<span className='material-symbols-outlined'>chevron_right</span>
									</button>
								</CartFooter>
							</CartSidebar>
						</ContentArea>
					</MainArea>
				</Wrapper>
		)
}


