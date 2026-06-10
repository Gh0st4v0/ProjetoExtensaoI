import { afterEach, describe, expect, it, vi } from 'vitest'
import { getToken, isTokenValid, removeToken, setToken } from '../cookieUtils'

const clearCookie = () => {
  document.cookie = 'authToken=; Max-Age=0; Path=/'
}

const makeToken = (payload) => {
  const encodedPayload = btoa(JSON.stringify(payload))
  return `header.${encodedPayload}.signature`
}

describe('cookieUtils', () => {
  afterEach(() => {
    clearCookie()
    vi.useRealTimers()
  })

  it('sets, reads and removes the auth token', () => {
    setToken('abc.def.ghi')

    expect(getToken()).toBe('abc.def.ghi')

    removeToken()

    expect(getToken()).toBeNull()
  })

  it('supports token values containing equals signs', () => {
    setToken('abc=def==')

    expect(getToken()).toBe('abc=def==')
  })

  it('validates tokens with future expiration dates', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    expect(isTokenValid(makeToken({ exp: 1767229200 }))).toBe(true)
  })

  it('rejects expired or malformed tokens', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    expect(isTokenValid(makeToken({ exp: 1700000000 }))).toBe(false)
    expect(isTokenValid('invalid-token')).toBe(false)
  })
})

