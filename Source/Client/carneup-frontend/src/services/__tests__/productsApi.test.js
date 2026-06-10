import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import {
  createProduct,
  getAllProducts,
  getAllProductsUnpaged,
  getProductById,
  searchProducts,
  updateProduct,
  updateProductPrice,
} from '../productsApi'

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('productsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates, gets and updates products with the expected endpoints', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    api.get.mockResolvedValue({ data: { id: 1, name: 'Picanha' } })
    api.put.mockResolvedValue({ data: { id: 1 } })

    await createProduct({ name: 'Picanha' })
    await expect(getProductById(1)).resolves.toEqual({ id: 1, name: 'Picanha' })
    await updateProduct(1, { name: 'Alcatra' })

    expect(api.post).toHaveBeenCalledWith('/products', { name: 'Picanha' })
    expect(api.get).toHaveBeenCalledWith('/products/1')
    expect(api.put).toHaveBeenCalledWith('/products/1', { name: 'Alcatra' })
  })

  it('lists and searches products with pagination params', async () => {
    api.get.mockResolvedValue({ data: { content: [] } })

    await expect(getAllProducts(2)).resolves.toEqual({ content: [] })
    await expect(searchProducts('carne', 3)).resolves.toEqual({ content: [] })

    expect(api.get).toHaveBeenNthCalledWith(1, '/products', { params: { page: 2 } })
    expect(api.get).toHaveBeenNthCalledWith(2, '/products/search', { params: { q: 'carne', page: 3 } })
  })

  it('loads all product pages into a single list', async () => {
    api.get
      .mockResolvedValueOnce({ data: { totalPages: 3, content: [{ id: 1 }] } })
      .mockResolvedValueOnce({ data: { content: [{ id: 2 }] } })
      .mockResolvedValueOnce({ data: { content: [{ id: 3 }] } })

    await expect(getAllProductsUnpaged()).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(api.get).toHaveBeenCalledTimes(3)
    expect(api.get).toHaveBeenNthCalledWith(1, '/products', { params: { page: 0 } })
    expect(api.get).toHaveBeenNthCalledWith(2, '/products', { params: { page: 1 } })
    expect(api.get).toHaveBeenNthCalledWith(3, '/products', { params: { page: 2 } })
  })

  it('updates product price and returns response data', async () => {
    api.patch.mockResolvedValue({ data: { id: 1, precoVenda: 30 } })

    await expect(updateProductPrice(1, 30)).resolves.toEqual({ id: 1, precoVenda: 30 })

    expect(api.patch).toHaveBeenCalledWith('/products/1/price', { precoVenda: 30 })
  })
})

