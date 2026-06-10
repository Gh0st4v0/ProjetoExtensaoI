import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { getToken, isTokenValid } from '../services/cookieUtils'

vi.mock('../services/cookieUtils', () => ({
  getToken: vi.fn(),
  isTokenValid: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}))

const BackView = ({ label, navigate, extra }) => (
  <section>
    <h1>{label}</h1>
    {extra}
    <button type="button" onClick={() => navigate('dashboard')}>back-dashboard</button>
  </section>
)

vi.mock('../views/LoginView', () => ({
  LoginView: ({ navigate }) => (
    <section>
      <h1>login-view</h1>
      <button type="button" onClick={() => navigate('dashboard')}>login-dashboard</button>
      <button type="button" onClick={() => navigate('forgot')}>login-forgot</button>
    </section>
  ),
}))

vi.mock('../views/DashboardView', () => ({
  DashboardView: ({ navigate }) => (
    <section>
      <h1>dashboard-view</h1>
      {[
        'sales',
        'stock',
        'discard',
        'purchases',
        'despesas',
        'attributes',
        'configuracoes',
        'settings',
        'config-loja',
      ].map(view => (
        <button key={view} type="button" onClick={() => navigate(view)}>{view}</button>
      ))}
      <button type="button" onClick={() => navigate('reports', { tab: 'clientes' })}>reports</button>
      <button type="button" onClick={() => navigate('cliente-historico', { clientId: 5 })}>client-history</button>
      <button type="button" onClick={() => navigate('purchases', { preselectProduct: { name: 'Picanha' } })}>purchase-product</button>
      <button type="button" onClick={() => navigate('unknown')}>unknown</button>
    </section>
  ),
}))

vi.mock('../views/SalesView', () => ({ SalesView: props => <BackView label="sales-view" {...props} /> }))
vi.mock('../views/StockViewV2', () => ({ StockView: props => <BackView label="stock-view" {...props} /> }))
vi.mock('../views/DiscardView', () => ({ DiscardView: props => <BackView label="discard-view" {...props} /> }))
vi.mock('../views/DespesasView', () => ({ DespesasView: props => <BackView label="despesas-view" {...props} /> }))
vi.mock('../views/AttributesView', () => ({ default: props => <BackView label="attributes-view" {...props} /> }))
vi.mock('../views/SettingsView', () => ({ SettingsView: props => <BackView label="settings-view" {...props} /> }))
vi.mock('../views/ConfiguracaoView', () => ({ ConfiguracaoView: props => <BackView label="config-view" {...props} /> }))
vi.mock('../views/PurchaseView', () => ({
  PurchaseView: props => <BackView label="purchase-view" extra={<span>{props.preselectProduct?.name}</span>} {...props} />,
}))
vi.mock('../views/ReportsView', () => ({
  ReportsView: props => <BackView label="reports-view" extra={<span>{props.initialTab}</span>} {...props} />,
}))
vi.mock('../views/ClienteHistoricoView', () => ({
  ClienteHistoricoView: props => <BackView label="history-view" extra={<span>client:{props.clientId}</span>} {...props} />,
}))
vi.mock('../views/ForgotPasswordView', () => ({
  ForgotPasswordView: ({ navigate, setRecoveryEmail }) => (
    <section>
      <h1>forgot-view</h1>
      <button type="button" onClick={() => { setRecoveryEmail('a@b.com'); navigate('code') }}>send-code</button>
    </section>
  ),
}))
vi.mock('../views/RecoveryCodeView', () => ({
  RecoveryCodeView: ({ navigate, recoveryEmail, setRecoveryCode }) => (
    <section>
      <h1>code-view</h1>
      <span>{recoveryEmail}</span>
      <button type="button" onClick={() => { setRecoveryCode('123456'); navigate('reset') }}>confirm-code</button>
    </section>
  ),
}))
vi.mock('../views/ResetPasswordView', () => ({
  ResetPasswordView: ({ navigate, recoveryCode }) => (
    <section>
      <h1>reset-view</h1>
      <span>{recoveryCode}</span>
      <button type="button" onClick={() => navigate('success')}>reset-done</button>
    </section>
  ),
}))
vi.mock('../views/SuccessView', () => ({
  SuccessView: ({ navigate }) => (
    <section>
      <h1>success-view</h1>
      <button type="button" onClick={() => navigate('login')}>success-login</button>
    </section>
  ),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    getToken.mockReturnValue(null)
    isTokenValid.mockReturnValue(false)
  })

  it('starts at login and runs the password recovery flow', () => {
    render(<App />)

    expect(screen.getByText('login-view')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'login-forgot' }))
    fireEvent.click(screen.getByRole('button', { name: 'send-code' }))
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'confirm-code' }))
    expect(screen.getByText('123456')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'reset-done' }))
    expect(screen.getByText('success-view')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'success-login' }))
    expect(screen.getByText('login-view')).toBeInTheDocument()
  })

  it('routes through authenticated views and passes navigation params', () => {
    getToken.mockReturnValue('token')
    isTokenValid.mockReturnValue(true)
    localStorage.setItem('accessLevel', 'ADM')
    render(<App />)

    expect(screen.getByText('dashboard-view')).toBeInTheDocument()
    for (const [button, label] of [
      ['sales', 'sales-view'],
      ['stock', 'stock-view'],
      ['discard', 'discard-view'],
      ['purchases', 'purchase-view'],
      ['despesas', 'despesas-view'],
      ['attributes', 'attributes-view'],
      ['configuracoes', 'settings-view'],
      ['settings', 'settings-view'],
      ['config-loja', 'config-view'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name: button }))
      expect(screen.getByText(label)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'back-dashboard' }))
    }

    fireEvent.click(screen.getByRole('button', { name: 'reports' }))
    expect(screen.getByText('clientes')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'back-dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'client-history' }))
    expect(screen.getByText('client:5')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'back-dashboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'purchase-product' }))
    expect(screen.getByText('Picanha')).toBeInTheDocument()
  })

  it('blocks admin-only routes for non-admin users and falls back on unknown routes', () => {
    getToken.mockReturnValue('token')
    isTokenValid.mockReturnValue(true)
    localStorage.setItem('accessLevel', 'USUARIO')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'reports' }))
    expect(screen.getByText('dashboard-view')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'unknown' }))
    expect(screen.getByText('login-view')).toBeInTheDocument()
  })
})
