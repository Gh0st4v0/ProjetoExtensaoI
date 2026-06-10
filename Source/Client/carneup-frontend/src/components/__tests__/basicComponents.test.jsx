import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthShell } from '../AuthShell'
import { Footer } from '../Footer'
import { SectionCard } from '../SectionCard'
import { SettingsInput } from '../SettingsInput'
import { Sidebar } from '../Sidebar'
import { StatsCard } from '../StatsCard'
import { Topbar } from '../Topbar'
import { logout } from '../../services/authApi'

vi.mock('../../services/authApi', () => ({
  logout: vi.fn(),
}))

describe('basic components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders simple content components', () => {
    render(
      <>
        <StatsCard label="Vendas" value="R$ 100" />
        <SectionCard title="Resumo" caption="Dados do dia">
          <button type="button">Acao</button>
        </SectionCard>
        <Footer />
        <Topbar title="Painel" />
        <SettingsInput aria-label="Loja" defaultValue="CarneUp" />
      </>,
    )

    expect(screen.getByText('Vendas')).toBeInTheDocument()
    expect(screen.getByText('R$ 100')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resumo' })).toBeInTheDocument()
    expect(screen.getByText('Dados do dia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acao' })).toBeInTheDocument()
    expect(screen.getByText(/CarneUp System/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Painel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Loja')).toHaveValue('CarneUp')
  })

  it('renders the auth shell around children', () => {
    render(
      <AuthShell>
        <form aria-label="Login">Formulario</form>
      </AuthShell>,
    )

    expect(screen.getByRole('heading', { name: 'CarneUp' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Login' })).toBeInTheDocument()
  })

  it('shows admin sidebar items and navigates', () => {
    localStorage.setItem('userName', 'Pedro Silva')
    localStorage.setItem('accessLevel', 'ADM')
    const navigate = vi.fn()

    render(<Sidebar activeView="dashboard" navigate={navigate} />)

    expect(screen.getByText('Pedro Silva')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('Marcas e Categorias')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Nova Venda/ })[0])
    fireEvent.click(screen.getByRole('button', { name: /Painel Inicial/ }))

    expect(navigate).toHaveBeenNthCalledWith(1, 'sales')
    expect(navigate).toHaveBeenNthCalledWith(2, 'dashboard')
  })

  it('hides admin sidebar items for operators and logs out', () => {
    localStorage.setItem('userName', 'Ana')
    localStorage.setItem('accessLevel', 'OP')
    const navigate = vi.fn()

    render(<Sidebar navigate={navigate} />)

    expect(screen.getByText('Operador')).toBeInTheDocument()
    expect(screen.queryByText('Marcas e Categorias')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Sair'))

    expect(logout).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('login')
  })
})
