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
	padding: 10px 16px 14px;
	border-top: 1px solid #e7e5e4;
	margin-top: auto;
	flex-shrink: 0;
`

const UserProfile = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	min-height: 36px;

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffdad6;
		color: #610005;
		font-family: 'Epilogue', sans-serif;
		font-size: 12px;
		font-weight: 900;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1px;

		p.name {
			font-size: 12px;
			line-height: 1.1;
			font-weight: 800;
			color: #1a1c1c;
			font-family: 'Epilogue', sans-serif;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin: 0;
		}

		p.role {
			font-size: 9px;
			line-height: 1.1;
			color: #78716c;
			font-family: 'Epilogue', sans-serif;
			text-transform: uppercase;
			opacity: 0.7;
			margin: 0;
		}
	}

	.logout-btn {
		background: none;
		border: none;
		color: #78716c;
		cursor: pointer;
		font-size: 18px;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: color 0.12s, background 0.12s;
		flex-shrink: 0;

		&:hover {
			background-color: #e7e5e4;
			color: #b91c1c;
		}
	}
`

export const Sidebar = ({ navigate, activeView }) => {
	const userName = localStorage.getItem('userName') || 'Usuário'
	const userId = localStorage.getItem('userId') || ''
	const accessLevel = localStorage.getItem('accessLevel') || ''
	const initials = userName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0])
		.join('') || 'U'

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
		relatorios: 'dashboard',
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
				<UserProfile>
					<div className='avatar'>{initials}</div>
					<div className='info'>
						<p className='name'>{userName}</p>
						<p className='role'>{accessLevel || (userId ? `ID ${userId}` : 'Sessão ativa')}</p>
					</div>
					<button className='logout-btn' onClick={handleLogout} title='Sair' aria-label='Sair'>
						<span className='material-symbols-outlined'>logout</span>
					</button>
				</UserProfile>
			</SidebarFooter>
		</SidebarContainer>
	)
}
