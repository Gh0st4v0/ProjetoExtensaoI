import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  getAllBrands,
  getAllCategories,
  updateBrand,
  updateCategory,
} from '../attributesApi'

vi.mock('../apiClient', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('attributesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads brands and categories', async () => {
    api.get
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Marca' }] })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Categoria' }] })

    await expect(getAllBrands()).resolves.toEqual([{ id: 1, name: 'Marca' }])
    await expect(getAllCategories()).resolves.toEqual([{ id: 2, name: 'Categoria' }])

    expect(api.get).toHaveBeenNthCalledWith(1, '/brands')
    expect(api.get).toHaveBeenNthCalledWith(2, '/categories')
  })

  it('creates, updates and deletes brands', async () => {
    await createBrand('Swift')
    await updateBrand(1, 'Friboi')
    await deleteBrand(1)

    expect(api.post).toHaveBeenCalledWith('/brands', { name: 'Swift' })
    expect(api.put).toHaveBeenCalledWith('/brands/1', { name: 'Friboi' })
    expect(api.delete).toHaveBeenCalledWith('/brands/1')
  })

  it('creates, updates and deletes categories', async () => {
    await createCategory('Bovino')
    await updateCategory(2, 'Suino')
    await deleteCategory(2)

    expect(api.post).toHaveBeenCalledWith('/categories', { name: 'Bovino' })
    expect(api.put).toHaveBeenCalledWith('/categories/2', { name: 'Suino' })
    expect(api.delete).toHaveBeenCalledWith('/categories/2')
  })
})

