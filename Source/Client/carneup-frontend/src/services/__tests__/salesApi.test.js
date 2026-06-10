import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import {
  createClient,
  createSale,
  deleteClient,
  getAllClients,
  getClientSales,
  getClientSpending,
  getSale,
  searchClients,
  updateClient,
} from '../salesApi'

vi.mock('../apiClient', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('salesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a sale and extracts the id from the Location header', async () => {
    api.post.mockResolvedValue({ headers: { location: '/sales/42' } })

    await expect(createSale({ items: [] })).resolves.toEqual({ saleId: 42 })

    expect(api.post).toHaveBeenCalledWith('/sales', { items: [] })
  })

  it('returns null sale id when the Location header is missing or invalid', async () => {
    api.post.mockResolvedValue({ headers: {} })

    await expect(createSale({ items: [] })).resolves.toEqual({ saleId: null })
  })

  it('loads sale and client data through the expected endpoints', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 1 }] } })

    await expect(getSale(1)).resolves.toEqual({ content: [{ id: 1 }] })
    await expect(searchClients('ana')).resolves.toEqual([{ id: 1 }])
    await expect(getAllClients()).resolves.toEqual({ content: [{ id: 1 }] })
    await expect(getClientSales(1, 2, 20)).resolves.toEqual({ content: [{ id: 1 }] })
    await expect(getClientSpending('2026-01-01', '2026-01-31')).resolves.toEqual({ content: [{ id: 1 }] })

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/1')
    expect(api.get).toHaveBeenNthCalledWith(2, '/clients/search', { params: { q: 'ana', page: 0 } })
    expect(api.get).toHaveBeenNthCalledWith(3, '/clients')
    expect(api.get).toHaveBeenNthCalledWith(4, '/clients/1/sales', { params: { page: 2, size: 20 } })
    expect(api.get).toHaveBeenNthCalledWith(5, '/sales/clients-spend', {
      params: { startDate: '2026-01-01', endDate: '2026-01-31' },
    })
  })

  it('creates a client from a string and returns id from Location header', async () => {
    api.post.mockResolvedValue({ headers: { Location: '/clients/9' } })

    await expect(createClient('Ana')).resolves.toBe('9')

    expect(api.post).toHaveBeenCalledWith('/clients', { nickname: 'Ana' })
  })

  it('creates a client from an object and returns id from body', async () => {
    api.post.mockResolvedValue({ headers: {}, data: { id: 10 } })

    await expect(createClient({ nickname: 'Bia' })).resolves.toBe('10')
  })

  it('falls back to searching client by nickname after creation', async () => {
    api.post.mockResolvedValue({ headers: {}, data: {} })
    api.get.mockResolvedValue({ data: { content: [{ id: 11 }] } })

    await expect(createClient({ nickname: 'Caio' })).resolves.toBe('11')

    expect(api.get).toHaveBeenCalledWith('/clients/search', { params: { q: 'Caio', page: 0 } })
  })

  it('returns null when client creation has no discoverable id', async () => {
    api.post.mockResolvedValue({ headers: {}, data: {} })
    api.get.mockRejectedValue(new Error('network'))

    await expect(createClient({ nickname: 'Duda' })).resolves.toBeNull()
  })

  it('updates and deletes clients', async () => {
    await updateClient(3, { nickname: 'Eva' })
    await deleteClient(3)

    expect(api.put).toHaveBeenCalledWith('/clients/3', { nickname: 'Eva' })
    expect(api.delete).toHaveBeenCalledWith('/clients/3')
  })
})

