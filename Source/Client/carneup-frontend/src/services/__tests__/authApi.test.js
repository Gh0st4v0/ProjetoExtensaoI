import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import {
  login,
  logout,
  requestPasswordRecovery,
  resetPassword,
  validateRecoveryCode,
} from '../authApi'
import { removeToken } from '../cookieUtils'

vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('../cookieUtils', () => ({
  removeToken: vi.fn(),
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('logs in and returns response data', async () => {
    api.post.mockResolvedValue({ data: { token: 'jwt' } })

    await expect(login('admin', 'secret')).resolves.toEqual({ token: 'jwt' })

    expect(api.post).toHaveBeenCalledWith('/sessions', {
      identifier: 'admin',
      password: 'secret',
    })
  })

  it('requests and validates password recovery flows', async () => {
    api.post
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: { reset: true } })
      .mockResolvedValueOnce({ data: { valid: true } })

    await expect(requestPasswordRecovery('user@example.com')).resolves.toEqual({ ok: true })
    await expect(resetPassword('token', 'new-password')).resolves.toEqual({ reset: true })
    await expect(validateRecoveryCode('token')).resolves.toEqual({ valid: true })

    expect(api.post).toHaveBeenNthCalledWith(1, '/sessions/password-recovery', {
      email: 'user@example.com',
    })
    expect(api.post).toHaveBeenNthCalledWith(2, '/sessions/reset-password', {
      token: 'token',
      newPassword: 'new-password',
    })
    expect(api.post).toHaveBeenNthCalledWith(3, '/sessions/validate-recovery-code', {
      token: 'token',
    })
  })

  it('logs out by clearing token and user data', () => {
    localStorage.setItem('userName', 'Pedro')
    localStorage.setItem('userId', '1')
    localStorage.setItem('accessLevel', 'ADMIN')

    logout()

    expect(removeToken).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('userName')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(localStorage.getItem('accessLevel')).toBeNull()
  })
})

