import styled from 'styled-components'
import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

// ==========================================
// ESTILOS
// ==========================================

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

	return (
		    <Wrapper>
			    <Sidebar navigate={navigate} activeView='sales' />

			<MainArea>
				<Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

				<ContentArea>
					<ProductSection>
						<Categories>
							<button className='active'>TODOS</button>
							<button className='inactive'>BOVINO</button>
							<button className='inactive'>SUÍNO</button>
							<button className='inactive'>FRANGO</button>
							<button className='inactive'>CORTES ESPECIAIS</button>
						</Categories>

						<ProductGrid>
							<ProductCard>
								<div className='img-wrapper'>
									<img
										src='https://lh3.googleusercontent.com/aida-public/AB6AXuC84ad8Fmzd2bqdgT_W5PBpqhxtiUITlJ9RBl0MojB8HhALiMllTu7c9iK1Ia271QYrIs69BvI1eVchZvIQQAZjG1RRgGRfHy0JNhviJbhmOTu3oWvqn5jpgKws40VgSzmOGYUitSKyJqCMqCwH2vc1CN6o5QvgVTafcWP-mOVlwXJaRBuAhLCI72bvvFkbx9JMI8xZKEKAZTfNOTWGfESxEfXgmZK-evGWiY2AerdLEsdaZDIUT-SV1YsmFRYj1TTNyYUlGmER_bk'
										alt='Picanha Maturatta'
									/>
								</div>
								<div className='info'>
									<div>
										<span className='category'>Bovino</span>
										<h3>Picanha Maturatta</h3>
									</div>
									<div className='price-row'>
										<span className='price-label'>R$ / KG</span>
										<span className='price'>124,50</span>
									</div>
								</div>
							</ProductCard>

							<ProductCard>
								<div className='img-wrapper'>
									<img
										src='https://lh3.googleusercontent.com/aida-public/AB6AXuCZxWh1EL-cZEja1sjsigHMTCspchHj61ggo23tHmHBZuPZwrt3Mw4-n-NWJ6LTDce7tziAHJ8KQ66a9i8Vp-5lMjAzJuCTf0hS0zW_7GX_koJHBXKWAwa5xUixAe8J-mZtdSVF3XIDmL97uXXreQ33t1a8fv0nAFkZbqqAbDg1-2ZhzDzyUHvavUmWhOSOd1nSosWzAPcnhak88kPkVn9dEHQ2oJ3-N6sejrS_nc0APZ5dY9pLeGTJyL5SrIp-ithnv1LsfTb6UUM'
										alt='Ribeye Premium'
									/>
								</div>
								<div className='info'>
									<div>
										<span className='category'>Bovino</span>
										<h3>Ribeye Premium</h3>
									</div>
									<div className='price-row'>
										<span className='price-label'>R$ / KG</span>
										<span className='price'>89,90</span>
									</div>
								</div>
							</ProductCard>

							<ProductCard>
								<div className='img-wrapper'>
									<img
										src='https://lh3.googleusercontent.com/aida-public/AB6AXuAVSYHyMqu41HzoBI-ywOMthFeZF-UgldiAUVlW3gjSMtZJVuRJEYHDutTJq7woASF9406issI1ojtyU6aYxHMusUv4nnHXaUHe476kytBqjaiHlz-GYC_yQJ-mnIic-GWMjh9_GYCKVLo57NHXsmx9azmgKWTwSmRxwhNpAf6QQPBbCbUsPsPvWCnO0-x9AbskvEbfH7VQtWgI8--GJa81P8T6NsikBLVT5iPSj5M6t71eU4XrQ5z6U3T01UpZxVEu58yFNPDiL-E'
										alt='T-Bone Porterhouse'
									/>
								</div>
								<div className='info'>
									<div>
										<span className='category'>Bovino</span>
										<h3>T-Bone Porterhouse</h3>
									</div>
									<div className='price-row'>
										<span className='price-label'>R$ / KG</span>
										<span className='price'>95,00</span>
									</div>
								</div>
							</ProductCard>
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
							<CartItem>
								<div className='details'>
									<h4>Picanha Maturatta</h4>
									<p>1.450 kg × R$ 124,50</p>
								</div>
								<div className='actions'>
									<p className='total'>R$ 180,52</p>
									<div className='controls'>
										<button>
											<span className='material-symbols-outlined'>remove</span>
										</button>
										<button>
											<span className='material-symbols-outlined'>add</span>
										</button>
									</div>
								</div>
							</CartItem>

							<CartItem>
								<div className='details'>
									<h4>Ribeye Premium</h4>
									<p>0.820 kg × R$ 89,90</p>
								</div>
								<div className='actions'>
									<p className='total'>R$ 73,71</p>
									<div className='controls'>
										<button>
											<span className='material-symbols-outlined'>remove</span>
										</button>
										<button>
											<span className='material-symbols-outlined'>add</span>
										</button>
									</div>
								</div>
							</CartItem>
						</CartItemsList>

						<CartFooter>
							<div className='total-box'>
								<div>
									<p className='label'>Valor Total</p>
									<p className='discount'>Desconto: R$ 0,00</p>
								</div>
								<div className='value'>R$ 254,23</div>
							</div>

							<div className='payment-section'>
								<p className='title'>Forma de Pagamento</p>
								<div className='grid'>
									<PaymentButton
										$active={pagamentoSelecionado === 'pix'}
										onClick={() => setPagamentoSelecionado('pix')}
									>
										<span className='material-symbols-outlined icon'>
											qr_code
										</span>
										<span className='text'>PIX</span>
									</PaymentButton>

									<PaymentButton
										$active={pagamentoSelecionado === 'dinheiro'}
										onClick={() => setPagamentoSelecionado('dinheiro')}
									>
										<span
											className='material-symbols-outlined icon'
											style={
												pagamentoSelecionado === 'dinheiro'
													? { fontVariationSettings: "'FILL' 1" }
													: {}
											}
										>
											payments
										</span>
										<span className='text'>Dinheiro</span>
									</PaymentButton>

									<PaymentButton
										$active={pagamentoSelecionado === 'credito'}
										onClick={() => setPagamentoSelecionado('credito')}
									>
										<span className='material-symbols-outlined icon'>
											credit_card
										</span>
										<span className='text'>Crédito</span>
									</PaymentButton>

									<PaymentButton
										$active={pagamentoSelecionado === 'debito'}
										onClick={() => setPagamentoSelecionado('debito')}
									>
										<span className='material-symbols-outlined icon'>
											contactless
										</span>
										<span className='text'>Débito</span>
									</PaymentButton>
								</div>
							</div>

							<button className='finalize-btn'>
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
