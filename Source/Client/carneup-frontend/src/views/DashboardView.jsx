import styled, { keyframes } from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { useState, useEffect, useCallback } from 'react'
import api from '../services/apiClient'

// ── Animations ─────────────────────────────────────────────────────────────────
const fadeUp = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`

// ── Layout ─────────────────────────────────────────────────────────────────────
const Wrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #f1f0ef;
	font-family: 'Work Sans', sans-serif;
	color: #1c1917;
`
const Main = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	overflow-x: hidden;
`

// ── Hero ───────────────────────────────────────────────────────────────────────
const Hero = styled.div`
	background: linear-gradient(135deg, #1a0002 0%, #610005 60%, #8a040d 100%);
	padding: 28px 32px 32px;
	position: relative;
	overflow: hidden;
	&::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
		pointer-events: none;
	}
`
const HeroTop = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 24px;
`
const Brand = styled.div`
	h1 {
		font-family: 'Epilogue', sans-serif;
		font-size: 22px;
		font-weight: 900;
		color: #fff;
		letter-spacing: -0.03em;
		margin: 0;
	}
	p {
		font-size: 12px;
		color: rgba(255,255,255,0.5);
		margin: 2px 0 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
`
const Clock = styled.div`
	text-align: right;
	p.time {
		font-family: 'Epilogue', sans-serif;
		font-size: 28px;
		font-weight: 900;
		color: #fff;
		letter-spacing: -0.02em;
		margin: 0;
		line-height: 1;
	}
	p.date {
		font-size: 11px;
		color: rgba(255,255,255,0.5);
		margin: 4px 0 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
`
const MetricsRow = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	animation: ${fadeUp} 0.4s ease;
`
const Metric = styled.div`
	background: rgba(255,255,255,0.08);
	border: 1px solid rgba(255,255,255,0.12);
	border-radius: 12px;
	padding: 16px 20px;
	backdrop-filter: blur(4px);
	p.label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: rgba(255,255,255,0.5);
		margin: 0 0 6px;
		font-weight: 600;
	}
	p.value {
		font-family: 'Epilogue', sans-serif;
		font-size: clamp(20px, 3vw, 28px);
		font-weight: 900;
		color: #fff;
		margin: 0;
		line-height: 1;
	}
	p.sub {
		font-size: 11px;
		color: rgba(255,255,255,0.4);
		margin: 4px 0 0;
	}
`

// ── Content ────────────────────────────────────────────────────────────────────
const Content = styled.div`
	padding: 24px 32px;
	display: flex;
	flex-direction: column;
	gap: 24px;
	flex: 1;
`
const SectionLabel = styled.p`
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.15em;
	color: #a8a29e;
	margin: 0 0 12px;
`

// ── Action Grid ────────────────────────────────────────────────────────────────
const ActionsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
	@media (min-width: 900px) { grid-template-columns: repeat(4, 1fr); }
`
const ActionBtn = styled.button`
	background: ${p => p.$primary ? '#610005' : '#fff'};
	border: ${p => p.$primary ? 'none' : '1px solid #e7e5e4'};
	border-radius: 14px;
	padding: 20px 16px;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
	transition: all 0.15s;
	text-align: left;
	box-shadow: ${p => p.$primary ? '0 4px 16px rgba(97,0,5,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'};

	&:hover {
		transform: translateY(-2px);
		box-shadow: ${p => p.$primary ? '0 8px 24px rgba(97,0,5,0.35)' : '0 4px 12px rgba(0,0,0,0.1)'};
	}
	&:active { transform: scale(0.98); }

	.icon-box {
		width: 40px; height: 40px; border-radius: 10px;
		background: ${p => p.$primary ? 'rgba(255,255,255,0.15)' : '#ffdad6'};
		display: flex; align-items: center; justify-content: center;
		span { color: ${p => p.$primary ? '#fff' : '#610005'}; font-size: 22px; }
	}
	.label {
		font-family: 'Epilogue', sans-serif;
		font-size: 13px; font-weight: 900;
		text-transform: uppercase; letter-spacing: 0.05em;
		color: ${p => p.$primary ? '#fff' : '#1c1917'};
	}
	.desc {
		font-size: 11px;
		color: ${p => p.$primary ? 'rgba(255,255,255,0.6)' : '#78716c'};
		margin-top: -8px;
	}
`

// ── Recent Sales ───────────────────────────────────────────────────────────────
const SalesCard = styled.div`
	background: #fff;
	border-radius: 14px;
	border: 1px solid #f0eeed;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`
const SalesHeader = styled.div`
	padding: 16px 20px;
	border-bottom: 1px solid #f5f5f4;
	display: flex;
	justify-content: space-between;
	align-items: center;
	h3 {
		font-family: 'Epilogue', sans-serif;
		font-weight: 900;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #1c1917;
		margin: 0;
	}
	button {
		font-size: 11px; font-weight: 700; color: #610005;
		background: none; border: none; cursor: pointer;
		text-transform: uppercase; letter-spacing: 0.08em;
		&:hover { text-decoration: underline; }
	}
`
const SaleRow = styled.div`
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px 20px;
	border-bottom: 1px solid #f9f8f8;
	&:last-child { border-bottom: none; }
	&:hover { background: #fafaf9; }
`
const SaleIcon = styled.div`
	width: 36px; height: 36px; border-radius: 8px;
	background: #ffdad6; display: flex; align-items: center; justify-content: center;
	flex-shrink: 0;
	span { color: #610005; font-size: 18px; }
`
const SaleInfo = styled.div`
	flex: 1; min-width: 0;
	p.id { font-weight: 700; font-size: 13px; color: #1c1917; margin: 0; }
	p.date { font-size: 11px; color: #a8a29e; margin: 1px 0 0; }
`
const SaleRight = styled.div`
	text-align: right;
	p.value { font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 15px; color: #1c1917; margin: 0; }
`
const PayBadge = styled.span`
	font-size: 9px; font-weight: 700; text-transform: uppercase;
	padding: 2px 7px; border-radius: 999px;
	background: ${p => ({ PIX: '#f0fdf4', DINHEIRO: '#fffbeb', CREDITO: '#eff6ff', DEBITO: '#faf5ff' })[p.$m] || '#f3f4f6'};
	color: ${p => ({ PIX: '#15803d', DINHEIRO: '#b45309', CREDITO: '#1d4ed8', DEBITO: '#7c3aed' })[p.$m] || '#374151'};
`
const EmptyMsg = styled.div`
	padding: 32px; text-align: center; color: #a8a29e; font-size: 13px;
	span { display: block; font-size: 32px; margin-bottom: 8px; }
`

// ── Footer ─────────────────────────────────────────────────────────────────────
const StatusBar = styled.div`
	background: #1c1917;
	padding: 8px 32px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: #57534e;
	flex-shrink: 0;
	.online { display: flex; align-items: center; gap: 6px;
		.dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; } }
	.brand { color: #610005; font-weight: 700; }
`

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const MASK = '••••••'
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const ACTIONS = [
	{ icon: 'point_of_sale', label: 'Nova Venda', desc: 'Iniciar atendimento', view: 'sales', primary: true },
	{ icon: 'add_shopping_cart', label: 'Entrada', desc: 'Registrar compra', view: 'purchases', primary: false },
	{ icon: 'inventory_2', label: 'Estoque', desc: 'Gerenciar produtos', view: 'stock', primary: false },
	{ icon: 'bar_chart', label: 'Relatórios', desc: 'Análise de vendas', view: 'reports', primary: false },
]

// ── Component ──────────────────────────────────────────────────────────────────
export const DashboardView = ({ navigate }) => {
	const [now, setNow] = useState(new Date())
	const [todayTotal, setTodayTotal] = useState(null)
	const [todayCount, setTodayCount] = useState(0)
	const [avgTicket, setAvgTicket] = useState(0)
	const [recentSales, setRecentSales] = useState([])
	const [loading, setLoading] = useState(true)
	const [hidden, setHidden] = useState(true)   // valores ocultos por padrão

	const val = (formatted) => hidden ? MASK : formatted

	// Clock
	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(t)
	}, [])

	// Data
	const loadData = useCallback(() => {
		const today = new Date().toISOString().slice(0, 10)
		setLoading(true)

		Promise.all([
			api.get(`/sales?startDate=${today}&endDate=${today}`).catch(() => ({ data: [] })),
			api.get('/sales?page=0&size=5').catch(() => ({ data: { content: [] } })),
		]).then(([todayResp, recentResp]) => {
			const todaySales = todayResp.data || []
			const total = todaySales.reduce((a, s) => a + (s.totalPrice || 0), 0)
			setTodayTotal(total)
			setTodayCount(todaySales.length)
			setAvgTicket(todaySales.length > 0 ? total / todaySales.length : 0)
			setRecentSales(recentResp.data?.content || [])
		}).finally(() => setLoading(false))
	}, [])

	useEffect(() => { loadData() }, [loadData])

	const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
	const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
	const userName = localStorage.getItem('userName') || 'Operador'

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='dashboard' />
			<Main>
				{/* ── Hero ── */}
				<Hero>
					<HeroTop>
						<Brand>
							<h1>🥩 CarneUp</h1>
							<p>Painel Operacional · {userName}</p>
						</Brand>
						<div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
							<button
								onClick={() => setHidden(h => !h)}
								title={hidden ? 'Exibir valores' : 'Ocultar valores'}
								style={{
									background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
									borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
									display: 'flex', alignItems: 'center', gap: 6,
									color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700,
									textTransform: 'uppercase', letterSpacing: '0.08em',
								}}
							>
								<span className='material-symbols-outlined' style={{ fontSize: 16 }}>
									{hidden ? 'visibility' : 'visibility_off'}
								</span>
								{hidden ? 'Exibir' : 'Ocultar'}
							</button>
							<Clock>
								<p className='time'>{timeStr}</p>
								<p className='date'>{dateStr}</p>
							</Clock>
						</div>
					</HeroTop>

					<MetricsRow>
						<Metric>
							<p className='label'>Faturamento Hoje</p>
							<p className='value' style={hidden ? { letterSpacing: 3 } : {}}>
								{loading ? '—' : val(fmt(todayTotal))}
							</p>
							<p className='sub'>{val(`${todayCount} venda${todayCount !== 1 ? 's' : ''} realizadas`)}</p>
						</Metric>
						<Metric>
							<p className='label'>Qtd. de Vendas</p>
							<p className='value' style={hidden ? { letterSpacing: 3 } : {}}>
								{loading ? '—' : val(String(todayCount))}
							</p>
							<p className='sub'>no dia de hoje</p>
						</Metric>
						<Metric>
							<p className='label'>Ticket Médio</p>
							<p className='value' style={hidden ? { letterSpacing: 3 } : {}}>
								{loading ? '—' : val(fmt(avgTicket))}
							</p>
							<p className='sub'>por atendimento</p>
						</Metric>
					</MetricsRow>
				</Hero>

				<Content>
					{/* ── Ações Rápidas ── */}
					<div>
						<SectionLabel>Ações Rápidas</SectionLabel>
						<ActionsGrid>
							{ACTIONS.map(a => (
								<ActionBtn key={a.view} $primary={a.primary} onClick={() => navigate(a.view)}>
									<div className='icon-box'>
										<span className='material-symbols-outlined' style={a.primary ? { fontVariationSettings: "'FILL' 1" } : {}}>
											{a.icon}
										</span>
									</div>
									<div>
										<p className='label'>{a.label}</p>
										<p className='desc'>{a.desc}</p>
									</div>
								</ActionBtn>
							))}
						</ActionsGrid>
					</div>

					{/* ── Últimas Vendas ── */}
					<div>
						<SectionLabel>Últimas Vendas</SectionLabel>
						<SalesCard>
							<SalesHeader>
								<h3>Transações Recentes</h3>
								<button onClick={() => navigate('reports')}>Ver relatório completo →</button>
							</SalesHeader>

							{loading && (
								<EmptyMsg><span className='material-symbols-outlined'>hourglass_empty</span>Carregando...</EmptyMsg>
							)}
							{!loading && recentSales.length === 0 && (
								<EmptyMsg>
									<span className='material-symbols-outlined'>receipt_long</span>
									Nenhuma venda registrada ainda.
								</EmptyMsg>
							)}
							{recentSales.map(s => (
								<SaleRow key={s.id}>
									<SaleIcon><span className='material-symbols-outlined'>receipt_long</span></SaleIcon>
									<SaleInfo>
										<p className='id'>Venda #{s.id}</p>
										<p className='date'>{s.saleDate || s.date || '—'}</p>
									</SaleInfo>
									<SaleRight>
										<p className='value' style={hidden ? { letterSpacing: 3 } : {}}>
											{val(fmt(s.totalValue || s.totalPrice))}
										</p>
										<PayBadge $m={s.paymentMethod}>{s.paymentMethod}</PayBadge>
									</SaleRight>
								</SaleRow>
							))}
						</SalesCard>
					</div>
				</Content>

				{/* ── Status Bar ── */}
				<StatusBar>
					<span className='online'><span className='dot' /> Sistema Online</span>
					<span>Terminal #01</span>
					<span className='brand'>CarneUp © 2026</span>
				</StatusBar>
			</Main>
		</Wrapper>
	)
}
