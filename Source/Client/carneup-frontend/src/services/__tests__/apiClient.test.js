import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { getToken, removeToken } from '../cookieUtils'
import api from '../apiClient'

const mockedAxios = vi.hoisted(() => {
  const state = {
    requestHandler: null,
    responseSuccess: null,
    responseError: null,
    api: null,
  }
  state.api = {
    interceptors: {
      request: {
        use: vi.fn((handler) => {
          state.requestHandler = handler
        }),
      },
      response: {
        use: vi.fn((success, error) => {
          state.responseSuccess = success
          state.responseError = error
        }),
      },
    },
  }
  return state
})

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockedAxios.api),
  },
}))

vi.mock('../cookieUtils', () => ({
  getToken: vi.fn(),
  removeToken: vi.fn(),
}))

describe('apiClient', () => {
  beforeEach(() => {
    getToken.mockReset()
    removeToken.mockClear()
    localStorage.clear()
  })

  it('creates an axios client with JSON defaults and registers interceptors', () => {
    expect(api).toBe(mockedAxios.api)
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: expect.any(String),
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(mockedAxios.api.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(mockedAxios.api.interceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('adds the bearer token to outgoing requests when available', () => {
    getToken.mockReturnValue('abc123')

    expect(mockedAxios.requestHandler({ headers: {} })).toEqual({
      headers: { Authorization: 'Bearer abc123' },
    })
  })

  it('leaves outgoing requests unchanged without a token', () => {
    getToken.mockReturnValue(null)

    expect(mockedAxios.requestHandler({ headers: { Accept: 'application/json' } })).toEqual({
      headers: { Accept: 'application/json' },
    })
  })

  it('returns successful responses and clears auth data on 401 errors', async () => {
    const reload = vi.fn()
    const originalLocation = window.location
    delete window.location
    window.location = { ...originalLocation, reload }
    localStorage.setItem('userName', 'Pedro')
    localStorage.setItem('userId', '1')
    localStorage.setItem('accessLevel', 'ADM')

    const response = { data: { ok: true } }
    expect(mockedAxios.responseSuccess(response)).toBe(response)

    const error = { response: { status: 401 } }
    await expect(mockedAxios.responseError(error)).rejects.toBe(error)
    expect(removeToken).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('userName')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(localStorage.getItem('accessLevel')).toBeNull()
    expect(reload).toHaveBeenCalledTimes(1)

    window.location = originalLocation
  })

  it('passes non-auth errors through without clearing storage', async () => {
    localStorage.setItem('accessLevel', 'ADM')
    const error = { response: { status: 500 } }

    await expect(mockedAxios.responseError(error)).rejects.toBe(error)
    expect(removeToken).not.toHaveBeenCalled()
    expect(localStorage.getItem('accessLevel')).toBe('ADM')
  })
})
