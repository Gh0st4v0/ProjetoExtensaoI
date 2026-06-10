import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import { createDiscard, deleteDiscard, getDiscards, getStockLots, updateDiscard } from '../discardApi'

vi.mock('../apiClient', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('discardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unwraps discard lists from arrays, paged responses and empty values', async () => {
    api.get
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: { content: [{ id: 2 }] } })
      .mockResolvedValueOnce({ data: null })

    await expect(getDiscards({ type: 'LOSS' })).resolves.toEqual([{ id: 1 }])
    await expect(getDiscards()).resolves.toEqual([{ id: 2 }])
    await expect(getDiscards()).resolves.toEqual([])

    expect(api.get).toHaveBeenNthCalledWith(1, '/discards', { params: { type: 'LOSS' } })
  })

  it('creates, updates and deletes discards', async () => {
    await createDiscard({ reason: 'Vencido' })
    await updateDiscard(1, { reason: 'Perda' })
    await deleteDiscard(1)

    expect(api.post).toHaveBeenCalledWith('/discards', { reason: 'Vencido' })
    expect(api.put).toHaveBeenCalledWith('/discards/1', { reason: 'Perda' })
    expect(api.delete).toHaveBeenCalledWith('/discards/1')
  })

  it('loads stock lots', async () => {
    api.get.mockResolvedValue({ data: [{ id: 10 }] })

    await expect(getStockLots()).resolves.toEqual([{ id: 10 }])

    expect(api.get).toHaveBeenCalledWith('/products/purchases')
  })
})

