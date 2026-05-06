import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { useState } from 'react'

// ==========================================
// ESTILOS
// ==========================================

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
	@media (min-width: 768px) {
		grid-column: span 6;
	}

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

	&:hover {
		transform: scale(1.01);
	}
	&:active {
		transform: scale(0.99);
	}

	.bg-icon {
		position: absolute;
		top: 24px;
		right: 24px;
		opacity: 0.2;
		font-size: 120px;
	}

	.content {
		position: relative;
		z-index: 10;
	}
	h2 {
		font-size: 36px;
		font-weight: 900;
		font-family: 'Epilogue', sans-serif;
		letter-spacing: -0.05em;
	}
	p {
		color: #ff9085;
		margin-top: 8px;
		opacity: 0.9;
	}
`

const ActionCard = styled.div`
	grid-column: span 12;
	@media (min-width: 768px) {
		grid-column: span 3;
	}

	background-color: #ffffff;
	border: 1px solid #f5f5f4;
	padding: 32px;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

	&:hover {
		background-color: #e2e2e2;
	}
	&:active {
		transform: scale(0.98);
	}

	.icon-wrapper {
		background-color: #eeeeee;
		color: #610005;
		padding: 12px;
		width: fit-content;
		border-radius: 8px;
	}
	h3 {
		font-size: 20px;
		font-weight: 700;
		font-family: 'Epilogue', sans-serif;
		color: #7f1d1d;
	}
	p {
		font-size: 14px;
		color: #5a403c;
		margin-top: 4px;
	}
`

const MetricsSection = styled.section`
	display: grid;
	grid-template-columns: repeat(1fr);
	gap: 24px;
	@media (min-width: 1024px) {
		grid-template-columns: repeat(3, 1fr);
	}
`

const MetricBox = styled.div`
	background-color: #ffffff;
	padding: 24px;
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	border-left: 4px solid ${(props) => props.$borderColor || '#610005'};

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
		p {
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			color: #5a403c;
			font-weight: 600;
		}
	}

	.value {
		display: flex;
		align-items: baseline;
		gap: 8px;
		p.big {
			font-size: 36px;
			font-weight: 900;
			font-family: 'Epilogue', sans-serif;
			color: #1a1c1c;
		}
		p.small {
			font-size: 14px;
			color: #5a403c;
		}
	}

	.footer-text {
		font-size: 10px;
		color: #78716c;
		margin-top: 8px;
	}
`

const SalesAndProductsSection = styled.section`
	display: grid;
	grid-template-columns: repeat(12, 1fr);
	gap: 32px;
`

const RecentSales = styled.div`
	grid-column: span 12;
	@media (min-width: 1280px) {
		grid-column: span 8;
	}
	background-color: #f3f3f3;
	padding: 24px;
	border-radius: 4px;

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		h3 {
			font-size: 20px;
			font-weight: 700;
			font-family: 'Epilogue', sans-serif;
			color: #7f1d1d;
		}
		button {
			background: none;
			border: none;
			font-size: 12px;
			font-weight: 700;
			color: #5a403c;
			cursor: pointer;
			&:hover {
				color: #610005;
			}
		}
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
`

const SaleRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	background-color: #ffffff;
	border-radius: 4px;
	transition: background-color 0.2s;

	&:hover {
		background-color: #fafafa;
	}

	.left {
		display: flex;
		align-items: center;
		gap: 16px;
		.icon {
			width: 40px;
			height: 40px;
			background-color: #eeeeee;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			color: #78716c;
		}
		p.order {
			font-weight: 700;
			font-size: 14px;
			color: #1a1c1c;
		}
		p.time {
			font-size: 10px;
			color: #78716c;
		}
	}

	.right {
		text-align: right;
		p.price {
			font-weight: 700;
			color: #1a1c1c;
		}
		span.badge {
			font-size: 9px;
			text-transform: uppercase;
			font-weight: 700;
			padding: 2px 6px;
			border-radius: 4px;
			background-color: ${(props) =>
				props.$status === 'pago' ? '#f0fdf4' : '#fffbeb'};
			color: ${(props) => (props.$status === 'pago' ? '#15803d' : '#b45309')};
		}
	}
`

const TopProducts = styled.div`
	grid-column: span 12;
	@media (min-width: 1280px) {
		grid-column: span 4;
	}
	display: flex;
	flex-direction: column;
	gap: 24px;

	h3 {
		font-size: 20px;
		font-weight: 700;
		font-family: 'Epilogue', sans-serif;
		color: #7f1d1d;
	}
`

const ProductCard = styled.div`
	background-color: #ffffff;
	border-radius: 4px;
	border: 1px solid #f5f5f4;
	overflow: hidden;
	transition: box-shadow 0.2s;

	&:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		img {
			transform: scale(1.1);
		}
	}

	.img-wrapper {
		height: 128px;
		width: 100%;
		overflow: hidden;
		background-color: #e7e5e4;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.5s;
		}
	}

	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		p.title {
			font-weight: 700;
			font-family: 'Epilogue', sans-serif;
			color: #1a1c1c;
		}
		p.sku {
			font-size: 10px;
			color: #5a403c;
		}
		p.price {
			color: #610005;
			font-weight: 700;
		}
	}
`

const BottomFooter = styled.footer`
	height: 40px;
	background-color: #e2e2e2;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: #55656d;
	flex-shrink: 0;

	.left {
		display: flex;
		align-items: center;
		gap: 16px;
		span.online {
			display: flex;
			align-items: center;
			gap: 4px;
		}
		.dot {
			width: 6px;
			height: 6px;
			background-color: #22c55e;
			border-radius: 50%;
		}
	}

	.right {
		display: flex;
		gap: 16px;
		span.brand {
			font-weight: 700;
			color: #610005;
		}
	}
`

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const DashboardView = ({ navigate }) => {
	const [searchQuery, setSearchQuery] = useState('')
	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='dashboard' />

			<MainContent>
				<Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

				<Canvas>
					<BentoSection>
						<MainCard>
							<span
								className='material-symbols-outlined bg-icon'
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								shopping_cart
							</span>
							<div className='content' onClick={() => navigate('sales')}>
								<h2>Nova Venda</h2>
								<p>Inicie um novo pedido rapidamente</p>
							</div>
						</MainCard>
						<ActionCard onClick={() => navigate('stock')}>
							<div className='icon-wrapper'>
								<span className='material-symbols-outlined'>
									add_shopping_cart
								</span>
							</div>
							<div>
								<h3>Entrada de Estoque</h3>
								<p>Lançar novas peças</p>
							</div>
						</ActionCard>
						<ActionCard onClick={() => navigate('stock')}>
							<div className='icon-wrapper'>
								<span className='material-symbols-outlined'>
									restaurant_menu
								</span>
							</div>
							<div>
								<h3>Novo Produto</h3>
								<p>Cadastrar corte especial</p>
							</div>
						</ActionCard>
					</BentoSection>

					<MetricsSection>
						<MetricBox $borderColor='#610005'>
							<div className='header'>
								<p>VENDAS DE HOJE</p>
								<span
									style={{
										color: '#610005',
										fontSize: '12px',
										fontWeight: 'bold',
										backgroundColor: '#ffdad6',
										padding: '4px 8px',
										borderRadius: '4px',
									}}
								>
									+12%
								</span>
							</div>
							<div className='value'>
								<p className='big'>R$ 12.450</p>
								<p className='small'>,80</p>
							</div>
							<div
								style={{
									marginTop: '16px', height: '4px', width: '100%', backgroundColor: '#eeeeee', borderRadius: '4px', overflow: 'hidden' }}>
					<div style={{ backgroundColor: '#610005', height: '100%', width: '75%' }} />
					</div>
					<p className='footer-text'>75% do objetivo diário atingido</p>
						</MetricBox>

						<MetricBox $borderColor='#00178d'>
							<div className='header'>
								<p>MARGEM DE LUCRO</p>
								<span
									className='material-symbols-outlined'
									style={{ color: '#00178d' }}
								>
									trending_up
								</span>
							</div>
							<div className='value'>
								<p className='big'>24.8%</p>
							</div>
							<div style={{ marginTop: '16px', display: 'flex', gap: '4px' }}>
								<div
									style={{
										height: '8px',
										flex: 1,
										backgroundColor: '#00178d',
										borderRadius: '2px',
									}}
								/>
								<div
									style={{
										height: '8px',
										flex: 1,
										backgroundColor: '#00178d',
										borderRadius: '2px',
									}}
								/>
								<div
									style={{
										height: '8px',
										flex: 1,
										backgroundColor: '#00178d',
										borderRadius: '2px',
										opacity: 0.3,
									}}
								/>
								<div
									style={{
										height: '8px',
										flex: 1,
										backgroundColor: '#00178d',
										borderRadius: '2px',
										opacity: 0.3,
									}}
								/>
							</div>
							<p className='footer-text'>Acima da média do setor (21%)</p>
						</MetricBox>

						<MetricBox $borderColor='#ba1a1a'>
							<div className='header'>
								<p>ALERTAS DE ESTOQUE</p>
								<span
									className='material-symbols-outlined'
									style={{
										color: '#ba1a1a',
										fontVariationSettings: "'FILL' 1",
									}}
								>
									warning
								</span>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '12px',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										fontSize: '14px',
									}}
								>
									<span style={{ fontWeight: 500 }}>Picanha Maturada</span>
									<span style={{ color: '#ba1a1a', fontWeight: 'bold' }}>
										2.4kg
									</span>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										fontSize: '14px',
									}}
								>
									<span style={{ fontWeight: 500 }}>Costela Bovina</span>
									<span style={{ color: '#ba1a1a', fontWeight: 'bold' }}>
										5.1kg
									</span>
								</div>
							</div>
							<button
								style={{
									marginTop: '16px',
									background: 'none',
									border: 'none',
									fontSize: '10px',
									textTransform: 'uppercase',
									fontWeight: 'bold',
									letterSpacing: '0.1em',
									color: '#610005',
									cursor: 'pointer',
								}}
								onClick={() => navigate('stock')}
							>
								Ver reposição pendente
							</button>
						</MetricBox>
					</MetricsSection>

					<SalesAndProductsSection>
						<RecentSales>
							<div className='header-row'>
								<h3>Últimas Vendas</h3>
								<button onClick={() => navigate('sales')}>Ver Tudo</button>
							</div>
							<div className='list'>
								<SaleRow $status='pago'>
									<div className='left'>
										<div className='icon'>
											<span className='material-symbols-outlined'>
												receipt_long
											</span>
										</div>
										<div>
											<p className='order'>Order #8829</p>
											<p className='time'>Há 4 min • Balcão 02</p>
										</div>
									</div>
									<div className='right'>
										<p className='price'>R$ 452,00</p>
										<span className='badge'>Pago</span>
									</div>
								</SaleRow>
								<SaleRow $status='pendente'>
									<div className='left'>
										<div className='icon'>
											<span className='material-symbols-outlined'>
												receipt_long
											</span>
										</div>
										<div>
											<p className='order'>Order #8828</p>
											<p className='time'>Há 12 min • Delivery</p>
										</div>
									</div>
									<div className='right'>
										<p className='price'>R$ 1.120,45</p>
										<span className='badge'>Pendente</span>
									</div>
								</SaleRow>
								<SaleRow $status='pago'>
									<div className='left'>
										<div className='icon'>
											<span className='material-symbols-outlined'>
												receipt_long
											</span>
										</div>
										<div>
											<p className='order'>Order #8827</p>
											<p className='time'>Há 25 min • Balcão 01</p>
										</div>
									</div>
									<div className='right'>
										<p className='price'>R$ 89,90</p>
										<span className='badge'>Pago</span>
									</div>
								</SaleRow>
							</div>
						</RecentSales>

						<TopProducts>
							<h3>Cortes em Destaque</h3>
							<ProductCard>
								<div className='img-wrapper'>
									<img
										src='https://lh3.googleusercontent.com/aida-public/AB6AXuDAh1Km7i22z_bszJESc0V6dRe2LAEPtoMLjg9Y-TaIQV1Pd2jgsfiyfxp8zqekcfMSJ6L8ESiR0-V6AjGmWfr83HIhWMCIORli8VI5SAdqz70OQeOQEYFPi-ulXNMllQcpqyYLB95maU2nzyNdHd3MMxegospdqFBSZOzIusmoezN_6YVNde2Jf_ml4N8SEm4wjguoxmlBMJPIFHPWND_4G9dw7XC47UzR3Ci-MTPDKHyuHRquOemFAPenSB-9tu_dY_aYalFOMfE'
										alt='Ribeye'
									/>
								</div>
								<div className='info'>
									<div>
										<p className='title'>Ribeye Premium</p>
										<p className='sku'>SKU: COW-RB-001</p>
									</div>
									<p className='price'>R$ 145/kg</p>
								</div>
							</ProductCard>
							<ProductCard>
								<div className='img-wrapper'>
									<img
										src='https://lh3.googleusercontent.com/aida-public/AB6AXuCR9_8-_LRyKb67mJtyZ0lq9NzK9bvo3pin1dn-t7zXoXfD1WKZYGBL2JpCG097WzsGRw9ttajzs72RNyfbxDLST-vijpnI2mB6j_6fAI1yK_WlN6JdBVjH8X9joRk1mNunnShaS6P0stcEP6tD-sBdjSN_P0lMK-ftKF07eV3oD1QoWkDAPW3EQShrce4v1K18Iv_YABML5bXQatX_BqS2RT5Rh8YYpZmI8Z5I9gJltUIMReTGUhWffJMgPIAMUz0KCD2P6MNPIWk'
										alt='Lamb'
									/>
								</div>
								<div className='info'>
									<div>
										<p className='title'>Carré de Cordeiro</p>
										<p className='sku'>SKU: LAM-CR-012</p>
									</div>
									<p className='price'>R$ 210/kg</p>
								</div>
							</ProductCard>
						</TopProducts>
					</SalesAndProductsSection>
				</Canvas>

				<BottomFooter>
					<div className='left'>
						<span className='online'>
							<div className='dot' /> System Online
						</span>
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






