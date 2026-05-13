import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { useState, useEffect } from 'react'
import api from '../services/apiClient'

const Wrapper = styled.div`
	background-color: #f9f9f9;
	color: #1a1c1c;
	display: flex;
	min-height: 100vh;
	font-family: 'Work Sans', sans-serif;
`
const MainContent = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`
const Canvas = styled.div`
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 32px;
	flex: 1;
	overflow-y: auto;
`
const BentoSection = styled.section`
	display: grid;
	grid-template-columns: repeat(12, 1fr);
	gap: 24px;
`
const MainCard = styled.div`
	grid-column: span 12;
	@media (min-width: 768px) { grid-column: span 6; }
	background-color: #8a040d;
	color: #ffffff;
	padding: 32px;
	border-radius: 4px;
	height: 256px;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	position: relative;
	cursor: pointer;
	overflow: hidden;
	transition: transform 0.2s;
	&:hover { transform: scale(1.01); }
	&:active { transform: scale(0.99); }
	.bg-icon { position: absolute; top: 24px; right: 24px; opacity: 0.2; font-size: 120px; }
	.content { position: relative; z-index: 10; }
	h2 { font-size: 36px; font-weight: 900; font-family: 'Epilogue', sans-serif; letter-spacing: -0.05em; }
	p { color: #ff9085; margin-top: 8px; opacity: 0.9; }
`
const ActionCard = styled.div`
	grid-column: span 12;
	@media (min-width: 768px) { grid-column: span 3; }
	background-color: #ffffff;
	border: 1px solid #f5f5f4;
	padding: 32px;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	&:hover { background-color: #e2e2e2; }
	.icon-wrapper { background-color: #eeeeee; color: #610005; padding: 12px; width: fit-content; border-radius: 8px; }
	h3 { font-size: 20px; font-weight: 700; font-family: 'Epilogue', sans-serif; color: #7f1d1d; }
	p { font-size: 14px; color: #5a403c; margin-top: 4px; }
`
const MetricsSection = styled.section`
	display: grid;
	gap: 24px;
	@media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
`
const MetricBox = styled.div`
	background-color: #ffffff;
	padding: 24px;
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	border-left: 4px solid ${p => p.$borderColor || '#610005'};
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
		p { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #5a403c; font-weight: 600; } }
	.value { display: flex; align-items: baseline; gap: 8px;
		p.big { font-size: 36px; font-weight: 900; font-family: 'Epilogue', sans-serif; color: #1a1c1c; }
		p.small { font-size: 14px; color: #5a403c; } }
	.footer-text { font-size: 10px; color: #78716c; margin-top: 8px; }
`
const SalesAndProductsSection = styled.section`
	display: grid;
	grid-template-columns: repeat(12, 1fr);
	gap: 32px;
`
const RecentSales = styled.div`
	grid-column: span 12;
	@media (min-width: 1280px) { grid-column: span 8; }
	background-color: #f3f3f3;
	padding: 24px;
	border-radius: 4px;
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
		h3 { font-size: 20px; font-weight: 700; font-family: 'Epilogue', sans-serif; color: #7f1d1d; }
		button { background: none; border: none; font-size: 12px; font-weight: 700; color: #5a403c; cursor: pointer;
			&:hover { color: #610005; } } }
	.list { display: flex; flex-direction: column; gap: 4px; }
`
const SaleRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	background-color: #ffffff;
	border-radius: 4px;
	.left { display: flex; align-items: center; gap: 16px;
		.icon { width: 40px; height: 40px; background-color: #eeeeee; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #78716c; }
		p.order { font-weight: 700; font-size: 14px; color: #1a1c1c; }
		p.time { font-size: 10px; color: #78716c; } }
	.right { text-align: right;
		p.price { font-weight: 700; color: #1a1c1c; }
		span.method { font-size: 9px; text-transform: uppercase; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f0fdf4; color: #15803d; } }
`
const BottomFooter = styled.footer`
	height: 40px; background-color: #e2e2e2; display: flex; align-items: center;
	justify-content: space-between; padding: 0 24px; font-size: 10px;
	text-transform: uppercase; letter-spacing: 0.1em; color: #55656d; flex-shrink: 0;
	.left { display: flex; align-items: center; gap: 16px;
		span.online { display: flex; align-items: center; gap: 4px; }
		.dot { width: 6px; height: 6px; background-color: #22c55e; border-radius: 50%; } }
	.right { display: flex; gap: 16px; span.brand { font-weight: 700; color: #610005; } }
`

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const PAYMENT_LABELS = { PIX: 'Pix', DINHEIRO: 'Dinheiro', CREDITO: 'Crédito', DEBITO: 'Débito' }

export const DashboardView = ({ navigate }) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [todayTotal, setTodayTotal] = useState(null)
	const [todayCount, setTodayCount] = useState(0)
	const [recentSales, setRecentSales] = useState([])
	const [loadingMetrics, setLoadingMetrics] = useState(true)
	const [loadingRecent, setLoadingRecent] = useState(true)

	useEffect(() => {
		const today = new Date().toISOString().slice(0, 10)
		api.get(`/sales?startDate=${today}&endDate=${today}`)
			.then(r => {
				const sales = r.data || []
				const total = sales.reduce((acc, s) => acc + (s.totalPrice || 0), 0)
				setTodayTotal(total)
				setTodayCount(sales.length)
			})
			.catch(() => {})
			.finally(() => setLoadingMetrics(false))

		api.get('/sales?page=0&size=5')
			.then(r => setRecentSales(r.data?.content || []))
			.catch(() => {})
			.finally(() => setLoadingRecent(false))
	}, [])

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='dashboard' />
			<MainContent>
				<Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
				<Canvas>
					<BentoSection>
						<MainCard>
							<span className='material-symbols-outlined bg-icon' style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
							<div className='content' onClick={() => navigate('sales')}>
								<h2>Nova Venda</h2>
								<p>Inicie um novo pedido rapidamente</p>
							</div>
						</MainCard>
						<ActionCard onClick={() => navigate('purchases')}>
							<div className='icon-wrapper'><span className='material-symbols-outlined'>add_shopping_cart</span></div>
							<div><h3>Entrada de Estoque</h3><p>Lançar novas peças</p></div>
						</ActionCard>
						<ActionCard onClick={() => navigate('stock')}>
							<div className='icon-wrapper'><span className='material-symbols-outlined'>restaurant_menu</span></div>
							<div><h3>Novo Produto</h3><p>Cadastrar corte especial</p></div>
						</ActionCard>
					</BentoSection>

					<MetricsSection>
						<MetricBox $borderColor='#610005'>
							<div className='header'>
								<p>VENDAS DE HOJE</p>
								<span style={{ color: '#610005', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ffdad6', padding: '4px 8px', borderRadius: '4px' }}>
									{todayCount} venda{todayCount !== 1 ? 's' : ''}
								</span>
							</div>
							<div className='value'>
								{loadingMetrics
									? <p className='big'>...</p>
									: <p className='big'>{fmt(todayTotal)}</p>}
							</div>
							<p className='footer-text'>Total de vendas registradas hoje</p>
						</MetricBox>

						<MetricBox $borderColor='#00178d'>
							<div className='header'>
								<p>RELATÓRIOS</p>
								<span className='material-symbols-outlined' style={{ color: '#00178d' }}>bar_chart</span>
							</div>
							<div className='value'>
								<p className='big' style={{ fontSize: 22, cursor: 'pointer' }} onClick={() => navigate('reports')}>Ver Relatórios</p>
							</div>
							<p className='footer-text' style={{ cursor: 'pointer' }} onClick={() => navigate('reports')}>
								Análise de vendas por período →
							</p>
						</MetricBox>

						<MetricBox $borderColor='#ba1a1a'>
							<div className='header'>
								<p>AÇÕES RÁPIDAS</p>
								<span className='material-symbols-outlined' style={{ color: '#ba1a1a', fontVariationSettings: "'FILL' 1" }}>bolt</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
								{[
									{ label: 'Registrar Descarte', view: 'discard' },
									{ label: 'Gerenciar Usuários', view: 'configuracoes' },
									{ label: 'Atributos (Marca/Categoria)', view: 'attributes' },
								].map(a => (
									<button key={a.view} onClick={() => navigate(a.view)}
										style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'Work Sans', color: '#1a1c1c' }}>
										{a.label}
									</button>
								))}
							</div>
						</MetricBox>
					</MetricsSection>

					<SalesAndProductsSection>
						<RecentSales>
							<div className='header-row'>
								<h3>Últimas Vendas</h3>
								<button onClick={() => navigate('reports')}>Ver Relatório Completo</button>
							</div>
							<div className='list'>
								{loadingRecent && <p style={{ color: '#78716c', fontSize: 14 }}>Carregando...</p>}
								{!loadingRecent && recentSales.length === 0 && (
									<p style={{ color: '#78716c', fontSize: 14 }}>Nenhuma venda registrada ainda.</p>
								)}
								{recentSales.map(s => (
									<SaleRow key={s.id}>
										<div className='left'>
											<div className='icon'><span className='material-symbols-outlined'>receipt_long</span></div>
											<div>
												<p className='order'>Venda #{s.id}</p>
												<p className='time'>{s.saleDate || s.date}</p>
											</div>
										</div>
										<div className='right'>
											<p className='price'>{fmt(s.totalValue || s.totalPrice)}</p>
											<span className='method'>{PAYMENT_LABELS[s.paymentMethod] || s.paymentMethod}</span>
										</div>
									</SaleRow>
								))}
							</div>
						</RecentSales>
					</SalesAndProductsSection>
				</Canvas>

				<BottomFooter>
					<div className='left'>
						<span className='online'><div className='dot' /> System Online</span>
						<span>Terminal #01 Active</span>
					</div>
					<div className='right'>
						<span>V: 1.0.0</span>
						<span className='brand'>CarneUp © 2026</span>
					</div>
				</BottomFooter>
			</MainContent>
		</Wrapper>
	)
}
