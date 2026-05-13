import React from 'react'
import styled from 'styled-components'
import { logout } from '../services/authApi'

// ── Styles ─────────────────────────────────────────────────────────────────────

const Side = styled.aside`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  width: 220px;
  background: var(--sidebar-bg);
  flex-shrink: 0;
  user-select: none;
`

const Logo = styled.div`
  padding: 18px 16px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  h1 {
    font-family: 'Epilogue', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0;
  }
  p {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.3);
    margin: 3px 0 0;
    font-weight: 600;
  }
`

const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  &::-webkit-scrollbar { display: none; }
`

const Group = styled.div`margin-bottom: 2px;`

const GroupLabel = styled.p`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.25);
  padding: 10px 16px 4px;
`

const Item = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  border: none;
  border-radius: 0;
  background: ${p => p.$active ? 'var(--sidebar-active)' : 'transparent'};
  color: ${p => p.$active ? '#fff' : 'var(--sidebar-text)'};
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, color 0.12s;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${p => p.$active ? '60%' : '0'};
    background: #ef4444;
    border-radius: 0 2px 2px 0;
    transition: height 0.15s;
  }

  &:hover {
    background: ${p => p.$active ? 'var(--sidebar-active)' : 'var(--sidebar-hover)'};
    color: var(--sidebar-text-hi);
  }

  span.ic {
    font-size: 18px;
    flex-shrink: 0;
    font-variation-settings: ${p => p.$active ? "'FILL' 1" : "'FILL' 0"};
  }

  span.lbl {
    font-family: 'Work Sans', sans-serif;
    font-size: 12px;
    font-weight: ${p => p.$active ? '700' : '500'};
    letter-spacing: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const QuickSale = styled.button`
  margin: 8px 12px;
  width: calc(100% - 24px);
  padding: 10px 14px;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-family: 'Epilogue', sans-serif;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(97,0,5,0.4);
  flex-shrink: 0;

  span { font-size: 16px; }
  &:hover { background: var(--brand-hover); transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 4px 0;
`

const Footer = styled.div`
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 12px 14px;
  flex-shrink: 0;
`

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  font-size: 13px;
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  p.name {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  p.role {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3);
    margin-top: 1px;
  }
`

const LogoutBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 4px;
  &:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
  span { font-size: 18px; }
`

// ── Data ───────────────────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: 'Operações',
    items: [
      { id: 'vendas',    label: 'Nova Venda',    icon: 'point_of_sale', route: 'sales' },
      { id: 'purchases', label: 'Entrada Estoque', icon: 'add_shopping_cart', route: 'purchases' },
      { id: 'discard',   label: 'Descartes',     icon: 'delete_forever', route: 'discard' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { id: 'estoque',    label: 'Produtos',    icon: 'inventory_2', route: 'stock' },
      { id: 'attributes', label: 'Marcas e Categorias', icon: 'label', route: 'attributes' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { id: 'relatorios', label: 'Relatórios', icon: 'bar_chart', route: 'reports' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'dashboard',     label: 'Painel Inicial', icon: 'dashboard', route: 'dashboard' },
      { id: 'configuracoes', label: 'Usuários',       icon: 'manage_accounts', route: 'configuracoes' },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

export const Sidebar = ({ navigate, activeView }) => {
  const handleLogout = () => { logout(); navigate('login') }

  const userName    = localStorage.getItem('userName')    || 'Usuário'
  const accessLevel = localStorage.getItem('accessLevel') || ''
  const initials    = userName.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

  return (
    <Side>
      <Logo>
        <h1>🥩 CarneUp</h1>
        <p>Gestão de Açougue</p>
      </Logo>

      <QuickSale onClick={() => navigate('sales')}>
        <span className='material-symbols-outlined'>point_of_sale</span>
        Nova Venda
      </QuickSale>

      <Nav>
        {GROUPS.map((g, gi) => (
          <Group key={gi}>
            {gi > 0 && <Divider />}
            <GroupLabel>{g.label}</GroupLabel>
            {g.items.map(item => (
              <Item
                key={item.id}
                $active={activeView === item.route}
                onClick={() => navigate(item.route)}
              >
                <span className='ic material-symbols-outlined'>{item.icon}</span>
                <span className='lbl'>{item.label}</span>
              </Item>
            ))}
          </Group>
        ))}
      </Nav>

      <Footer>
        <UserRow>
          <Avatar>{initials || '?'}</Avatar>
          <UserInfo>
            <p className='name'>{userName}</p>
            <p className='role'>{accessLevel === 'ADM' ? 'Administrador' : 'Operador'}</p>
          </UserInfo>
          <LogoutBtn onClick={handleLogout} title='Sair'>
            <span className='material-symbols-outlined'>logout</span>
          </LogoutBtn>
        </UserRow>
      </Footer>
    </Side>
  )
}
