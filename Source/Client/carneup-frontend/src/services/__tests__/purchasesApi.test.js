import { describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import { createPurchase } from '../purchasesApi'

vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('purchasesApi', () => {
  it('creates purchases', async () => {
    await createPurchase({ items: [{ productId: 1 }] })

    expect(api.post).toHaveBeenCalledWith('/purchases', { items: [{ productId: 1 }] })
  })
})

