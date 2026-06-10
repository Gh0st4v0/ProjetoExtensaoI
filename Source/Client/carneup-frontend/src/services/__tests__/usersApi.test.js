import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import { createUser, deleteUser, getUsers, updateUser } from '../usersApi'

vi.mock('../apiClient', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unwraps user lists from arrays, paged responses and empty values', async () => {
    api.get
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: { content: [{ id: 2 }] } })
      .mockResolvedValueOnce({ data: null })

    await expect(getUsers()).resolves.toEqual([{ id: 1 }])
    await expect(getUsers()).resolves.toEqual([{ id: 2 }])
    await expect(getUsers()).resolves.toEqual([])
  })

  it('creates, updates and deletes users', async () => {
    await createUser({ name: 'Admin' })
    await updateUser(1, { name: 'Operador' })
    await deleteUser(1)

    expect(api.post).toHaveBeenCalledWith('/users', { name: 'Admin' })
    expect(api.put).toHaveBeenCalledWith('/users/1', { name: 'Operador' })
    expect(api.delete).toHaveBeenCalledWith('/users/1')
  })
})

