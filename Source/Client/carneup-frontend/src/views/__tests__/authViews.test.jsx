import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordView } from '../ForgotPasswordView'
import { LoginView } from '../LoginView'
import { RecoveryCodeView } from '../RecoveryCodeView'
import { ResetPasswordView } from '../ResetPasswordView'
import { SuccessView } from '../SuccessView'
import {
  login,
  requestPasswordRecovery,
  resetPassword,
  validateRecoveryCode,
} from '../../services/authApi'
import { setToken } from '../../services/cookieUtils'
import { useAttributes } from '../../context/AttributesContext'

vi.mock('../../components/AuthShell', () => ({
  AuthShell: ({ children }) => <main>{children}</main>,
}))

vi.mock('../../services/authApi', () => ({
  login: vi.fn(),
  requestPasswordRecovery: vi.fn(),
  resetPassword: vi.fn(),
  validateRecoveryCode: vi.fn(),
}))

vi.mock('../../services/cookieUtils', () => ({
  setToken: vi.fn(),
}))

vi.mock('../../context/AttributesContext', () => ({
  useAttributes: vi.fn(),
}))

describe('auth views', () => {
  const navigate = vi.fn()
  const reload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    reload.mockResolvedValue(undefined)
    useAttributes.mockReturnValue({ reload })
  })

  it('validates required login fields before calling the API', () => {
    render(<LoginView navigate={navigate} />)

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(login).not.toHaveBeenCalled()
    expect(screen.getByText(/Preencha/)).toBeInTheDocument()
  })

  it('logs in, stores session data, reloads attributes and navigates to dashboard', async () => {
    login.mockResolvedValue({
      token: 'jwt-token',
      userName: 'Pedro',
      userId: 7,
      accessLevel: 'ADMIN',
    })

    render(<LoginView navigate={navigate} />)

    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: ' pedro@example.com ' },
    })
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('dashboard')
    })

    expect(login).toHaveBeenCalledWith('pedro@example.com', 'secret')
    expect(setToken).toHaveBeenCalledWith('jwt-token')
    expect(localStorage.getItem('userName')).toBe('Pedro')
    expect(localStorage.getItem('userId')).toBe('7')
    expect(localStorage.getItem('accessLevel')).toBe('ADMIN')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows login errors returned by unauthorized responses', async () => {
    login.mockRejectedValue({ response: { status: 401 } })

    render(<LoginView navigate={navigate} />)

    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'pedro@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(await screen.findByText(/incorretos/)).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('requests a recovery code and moves to the code step', async () => {
    const setRecoveryEmail = vi.fn()
    requestPasswordRecovery.mockResolvedValue({ ok: true })

    render(
      <ForgotPasswordView
        navigate={navigate}
        setRecoveryEmail={setRecoveryEmail}
      />,
    )

    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: ' user@example.com ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Enviar codigo/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('code')
    })

    expect(requestPasswordRecovery).toHaveBeenCalledWith('user@example.com')
    expect(setRecoveryEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('shows the recovery API error message', async () => {
    requestPasswordRecovery.mockRejectedValue({
      response: { data: { message: 'E-mail nao encontrado.' } },
    })

    render(
      <ForgotPasswordView
        navigate={navigate}
        setRecoveryEmail={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'missing@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Enviar codigo/i }))

    expect(await screen.findByText('E-mail nao encontrado.')).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('uppercases and validates the six-character recovery code', async () => {
    const setRecoveryCode = vi.fn()
    validateRecoveryCode.mockResolvedValue({ valid: true })

    render(
      <RecoveryCodeView
        navigate={navigate}
        recoveryEmail="user@example.com"
        setRecoveryCode={setRecoveryCode}
      />,
    )

    const inputs = screen.getAllByRole('textbox')
    ;['a', 'b', 'c', '1', '2', '3'].forEach((value, index) => {
      fireEvent.change(inputs[index], { target: { value } })
    })

    expect(inputs[0]).toHaveValue('A')
    expect(inputs[1]).toHaveValue('B')
    expect(inputs[2]).toHaveValue('C')

    fireEvent.click(screen.getByRole('button', { name: /Confirmar codigo/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('reset')
    })

    expect(validateRecoveryCode).toHaveBeenCalledWith('ABC123')
    expect(setRecoveryCode).toHaveBeenCalledWith('ABC123')
  })

  it('requires all recovery code characters before validating', () => {
    render(
      <RecoveryCodeView
        navigate={navigate}
        recoveryEmail="user@example.com"
        setRecoveryCode={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Confirmar codigo/i }))

    expect(validateRecoveryCode).not.toHaveBeenCalled()
    expect(screen.getByText(/Informe os 6 caracteres/)).toBeInTheDocument()
  })

  it('validates password reset requirements before submitting', () => {
    render(<ResetPasswordView navigate={navigate} recoveryCode="ABC123" />)

    fireEvent.change(screen.getByLabelText(/Nova senha/i), {
      target: { value: 'weak' },
    })
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'weak' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar senha/i }))

    expect(resetPassword).not.toHaveBeenCalled()
    expect(screen.getByText(/no minimo 8 caracteres/)).toBeInTheDocument()
  })

  it('resets the password and navigates to success', async () => {
    resetPassword.mockResolvedValue({ ok: true })

    render(<ResetPasswordView navigate={navigate} recoveryCode="ABC123" />)

    fireEvent.change(screen.getByLabelText(/Nova senha/i), {
      target: { value: 'Strong1!' },
    })
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'Strong1!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar senha/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('success')
    })

    expect(resetPassword).toHaveBeenCalledWith('ABC123', 'Strong1!')
  })

  it('navigates back to login from the success view', () => {
    render(<SuccessView navigate={navigate} />)

    fireEvent.click(screen.getByRole('button', { name: /Voltar para login/i }))

    expect(navigate).toHaveBeenCalledWith('login')
  })
})
