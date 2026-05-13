import { useState } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import api from '../services/apiClient'

const Wrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #f9f9f9;
	font-family: 'Work Sans', sans-serif;
`
const MainArea = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`
const Content = styled.div`
	padding: 32px;
	max-width: 1280px;
	margin: 0 auto;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 28px;
`
const PageTitle = styled.h2`
	font-family: 'Epilogue', sans-serif;
	font-weight: 900;
	color: #610005;
	text-transform: uppercase;
	font-size: 28px;
	margin: 0;
`
const FilterCard = styled.div`
	background: #fff;
	border-radius: 12px;
	padding: 24px;
	border: 1px solid #f0f0f0;
	display: flex;
	gap: 16px;
	align-items: flex-end;
	flex-wrap: wrap;
`
const Field = styled.div`display: flex; flex-direction: column; gap: 6px;`
const FieldLabel = styled.label`
	font-size: 10px; font-weight: 700; text-transform: uppercase;
	letter-spacing: 0.1em; color: #5a403c;
`
const DateInput = styled.input`
	padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
	font-size: 14px; font-family: 'Work Sans', sans-serif;
`
const BtnGerar = styled.button`
	padding: 10px 24px; background: #610005; color: #fff;
	border: none; border-radius: 8px; font-family: 'Epilogue', sans-serif;
	font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;
	cursor: pointer; white-space: nowrap;
	&:hover { background: #7f1d1d; }
	&:disabled { opacity: 0.6; cursor: not-allowed; }
`
const SummaryGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
`
const SummaryCard = styled.div`
	background: #fff; border-radius: 10px; padding: 20px;
	border-left: 4px solid ${p => p.$color || '#610005'};
	box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	p.label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin: 0 0 8px; }
	p.value { font-size: 28px; font-weight: 900; font-family: 'Epilogue', sans-serif; color: #1a1c1c; margin: 0; }
	p.sub { font-size: 12px; color: #78716c; margin: 4px 0 0; }
`
const TableWrapper = styled.div`
	background: #fff; border-radius: 12px; padding: 24px;
	border: 1px solid #f0f0f0; overflow-x: auto;
`
const Table = styled.table`
	width: 100%; border-collapse: collapse; font-size: 14px;
	th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
		color: #78716c; padding: 8px 12px; border-bottom: 2px solid #f0f0f0; }
	td { padding: 12px; border-bottom: 1px solid #f9f9f9; color: #1a1c1c; }
	tr:hover td { background: #fafafa; }
`
const Badge = styled.span`
	font-size: 10px; font-weight: 700; text-transform: uppercase;
	padding: 3px 8px; border-radius: 6px;
	background: ${p => ({ PIX: '#f0fdf4', DINHEIRO: '#fffbeb', CREDITO: '#eff6ff', DEBITO: '#faf5ff' })[p.$method] || '#f3f4f6'};
	color: ${p => ({ PIX: '#15803d', DINHEIRO: '#b45309', CREDITO: '#1d4ed8', DEBITO: '#7c3aed' })[p.$method] || '#374151'};
`
const EmptyMsg = styled.p`color: #78716c; text-align: center; padding: 40px; font-size: 14px;`
const ErrorMsg = styled.p`color: #b91c1c; font-size: 13px;`

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const pct = (a, b) => (b && b > 0) ? (((a - b) / b) * 100).toFixed(1) + '%' : '-'

const today = () => new Date().toISOString().slice(0, 10)
const firstDayOfMonth = () => {
	const d = new Date()
	return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export const ReportsView = ({ navigate }) => {
	const [startDate, setStartDate] = useState(firstDayOfMonth())
	const [endDate, setEndDate] = useState(today())
	const [sales, setSales] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleGenerate = () => {
		if (!startDate || !endDate) return
		setLoading(true)
		setError('')
		api.get(`/sales?startDate=${startDate}&endDate=${endDate}`)
			.then(r => setSales(r.data || []))
			.catch(() => setError('Erro ao buscar relatório. Tente novamente.'))
			.finally(() => setLoading(false))
	}

	const totalRevenue = sales?.reduce((a, s) => a + (s.totalPrice || 0), 0) || 0
	const totalCost = sales?.reduce((a, s) => a + (s.totalCost || 0), 0) || 0
	const totalProfit = totalRevenue - totalCost
	const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='reports' />
			<MainArea>
				<Topbar searchQuery='' onSearchChange={() => {}} />
				<Content>
					<div>
						<PageTitle>Relatórios de Vendas</PageTitle>
						<p style={{ color: '#5a403c', margin: '4px 0 0' }}>Analise o desempenho por período.</p>
					</div>

					<FilterCard>
						<Field>
							<FieldLabel>Data Inicial</FieldLabel>
							<DateInput type='date' value={startDate} onChange={e => setStartDate(e.target.value)} />
						</Field>
						<Field>
							<FieldLabel>Data Final</FieldLabel>
							<DateInput type='date' value={endDate} onChange={e => setEndDate(e.target.value)} />
						</Field>
						<BtnGerar onClick={handleGenerate} disabled={loading}>
							{loading ? 'Gerando...' : 'Gerar Relatório'}
						</BtnGerar>
					</FilterCard>

					{error && <ErrorMsg>{error}</ErrorMsg>}

					{sales !== null && (
						<>
							<SummaryGrid>
								<SummaryCard $color='#610005'>
									<p className='label'>Faturamento</p>
									<p className='value'>{fmt(totalRevenue)}</p>
									<p className='sub'>{sales.length} venda{sales.length !== 1 ? 's' : ''} no período</p>
								</SummaryCard>
								<SummaryCard $color='#b45309'>
									<p className='label'>Custo Total</p>
									<p className='value'>{fmt(totalCost)}</p>
									<p className='sub'>CMV do período</p>
								</SummaryCard>
								<SummaryCard $color='#15803d'>
									<p className='label'>Lucro Bruto</p>
									<p className='value'>{fmt(totalProfit)}</p>
									<p className='sub'>Margem: {margin}%</p>
								</SummaryCard>
								<SummaryCard $color='#1d4ed8'>
									<p className='label'>Ticket Médio</p>
									<p className='value'>{fmt(sales.length > 0 ? totalRevenue / sales.length : 0)}</p>
									<p className='sub'>Por venda</p>
								</SummaryCard>
							</SummaryGrid>

							<TableWrapper>
								<h3 style={{ fontFamily: 'Epilogue', fontWeight: 900, color: '#7f1d1d', margin: '0 0 16px', fontSize: 18 }}>
									Detalhamento das Vendas
								</h3>
								{sales.length === 0 ? (
									<EmptyMsg>Nenhuma venda encontrada no período selecionado.</EmptyMsg>
								) : (
									<Table>
										<thead>
											<tr>
												<th>#</th>
												<th>Data</th>
												<th>Vendedor</th>
												<th>Pagamento</th>
												<th style={{ textAlign: 'right' }}>Custo</th>
												<th style={{ textAlign: 'right' }}>Faturamento</th>
												<th style={{ textAlign: 'right' }}>Margem</th>
											</tr>
										</thead>
										<tbody>
											{sales.map(s => {
												const rev = s.totalPrice || 0
												const cost = s.totalCost || 0
												const m = rev > 0 ? (((rev - cost) / rev) * 100).toFixed(1) : '0.0'
												return (
													<tr key={s.id}>
														<td style={{ color: '#78716c' }}>#{s.id}</td>
														<td>{s.saleDate}</td>
														<td>{s.salesmanName || '—'}</td>
														<td><Badge $method={s.paymentMethod}>{s.paymentMethod}</Badge></td>
														<td style={{ textAlign: 'right' }}>{fmt(cost)}</td>
														<td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(rev)}</td>
														<td style={{ textAlign: 'right', color: parseFloat(m) >= 0 ? '#15803d' : '#b91c1c' }}>
															{m}%
														</td>
													</tr>
												)
											})}
										</tbody>
									</Table>
								)}
							</TableWrapper>
						</>
					)}
				</Content>
			</MainArea>
		</Wrapper>
	)
}

export default ReportsView
