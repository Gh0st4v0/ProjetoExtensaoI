import React from 'react'
import styled from 'styled-components'
import { logout } from '../services/authApi'

const SidebarContainer = styled.aside`
	display: flex;
	flex-direction: column;
	height: 100vh;
	position: sticky;
	top: 0;
	width: 256px;
	background-color: #f5f5f4;
	transition: background-color 0.2s;
	flex-shrink: 0;
`

const SidebarHeader = styled.div`
	padding: 24px;
	flex-shrink: 0;

	h1 {
		font-size: 24px;
		font-weight: 900;
		color: #7f1d1d;
		font-family: 'Epilogue', sans-serif;
		letter-spacing: -0.025em;
	}

	p {
		font-size: 12px;
		font-family: 'Epilogue', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #78716c;
		margin-top: 4px;
	}
`

const Nav = styled.nav`
	flex: 1;
	padding: 0 16px;
	margin-top: 16px;
	overflow-y: auto;
	min-height: 0;

	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background-color: #d6d3d1;
		border-radius: 4px;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
`

const NavItem = styled.a`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px 24px;
	color: ${(props) => (props.$active ? '#b91c1c' : '#57534e')};
	font-weight: 700;
	text-decoration: none;
	border-right: ${(props) => (props.$active ? '4px solid #b91c1c' : 'none')};
	transition: all 0.1s;
	cursor: pointer;

	span.icon {
		font-size: 24px;
	}
	span.text {
		font-family: 'Epilogue', sans-serif;
		letter-spacing: -0.025em;
	}

	&:hover {
		background-color: #e7e5e4;
		color: ${(props) => (props.$active ? '#b91c1c' : '#991b1b')};
	}
`

const SidebarFooter = styled.div`
	padding: 20px 20px 28px 20px;
	border-top: 1px solid #e7e5e4;
	margin-top: auto;
	display: flex;
	flex-direction: column;
	gap: 12px;
	flex-shrink: 0;
`

const NovaVendaBtn = styled.button`
	width: 100%;
	background-color: #610005;
	color: #ffffff;
	padding: 12px 14px;
	border-radius: 8px;
	font-family: 'Epilogue', sans-serif;
	font-weight: 800;
	border: none;
	cursor: pointer;
	transition: transform 0.12s, opacity 0.12s;
	box-shadow: 0 6px 18px rgba(97,0,5,0.08);

	&:hover {
		opacity: 0.95;
	}
	&:active {
		transform: translateY(1px) scale(0.995);
	}
`

const UserProfile = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;

	img {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid rgba(97,0,5,0.08);
	}

	.info {
		flex: 1;
		p.name {
			font-size: 13px;
			font-weight: 800;
			color: #1a1c1c;
			font-family: 'Epilogue', sans-serif;
		}
		p.role {
			font-size: 10px;
			color: #78716c;
			font-family: 'Epilogue', sans-serif;
			text-transform: uppercase;
			opacity: 0.7;
		}
	}

	.logout-btn {
		background: none;
		border: none;
		color: #78716c;
		cursor: pointer;
		font-size: 18px;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.12s, background 0.12s;

		&:hover {
			background-color: #e7e5e4;
			color: #b91c1c;
		}
	}
`

export const Sidebar = ({ navigate, activeView }) => {
	const handleLogout = () => {
		logout()
		navigate('login')
	}



	const navItems = [
		{ id: 'dashboard', label: 'Tela Inicial', icon: 'dashboard' },
		{ id: 'estoque', label: 'Gerenciamento de Estoque', icon: 'inventory_2' },
		{ id: 'vendas', label: 'Vendas', icon: 'point_of_sale' },
		{ id: 'purchases', label: 'Compras', icon: 'shopping_cart' },
		{ id: 'discard', label: 'Descarte', icon: 'delete' },
		{ id: 'attributes', label: 'Atributos', icon: 'inventory_2' },
		{ id: 'relatorios', label: 'Relatórios', icon: 'analytics' },
		{ id: 'configuracoes', label: 'Configurações', icon: 'settings' }
	]

	const routeMap = {
		dashboard: 'dashboard',
		estoque: 'stock',
		vendas: 'sales',
		purchases: 'purchases',
		discard: 'discard',
		relatorios: 'reports',
		configuracoes: 'configuracoes',
	}

	return (
		<SidebarContainer>
			<SidebarHeader>
				<h1>CarneUp</h1>
				<p>Mestre Açougueiro</p>
			</SidebarHeader>

			<Nav>
				<ul>
					{navItems.map(item => {
						const target = routeMap[item.id] ?? item.id
						return (
							<li key={item.id}>
								<NavItem $active={activeView === target} onClick={() => navigate(target)}>
									<span className='material-symbols-outlined icon'>{item.icon}</span>
									<span className='text'>{item.label}</span>
								</NavItem>
							</li>
						)
					})}
				</ul>
			</Nav>

			<SidebarFooter>
				<NovaVendaBtn onClick={() => navigate('sales')}>Nova Venda</NovaVendaBtn>
				<UserProfile>
					<img
						src='https://lh3.googleusercontent.com/aida-public/AB6AXuA5VgXi1wbpjE8KAklFI9S7PH4-zOdOwyty8vIE8CukR8J06_oAYGqlx_F97T93mlCzAfsCs-ek9omgmFIItVCNVVmT9_H9xdkVmmCjlnYK-64bRQA1Qibx459vqUCYXOEui3IDScurxBZAcBzTK-wWgMC2T_Z62AWTruk-v-kAmTpb1lS4ggOMVm5INqrKwaZSRpSRP-RSq-1TT22vsNfwOv4AMFqu2HiZTWAKM6orM1JS8A7DTGog5DAvXXqJW1Zq0IG27PKpuCQ'
						alt='Profile'
					/>
					<div className='info'>
						<p className='name'>Ricardo M.</p>
						<p className='role'>Admin Access</p>
					</div>
					<button className='logout-btn' onClick={handleLogout} title='Sair'>
						<span className='material-symbols-outlined'>logout</span>
					</button>
				</UserProfile>
			</SidebarFooter>
		</SidebarContainer>
	)
}