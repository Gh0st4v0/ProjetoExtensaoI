import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../apiClient'
import { createDespesa, deleteDespesa, getDespesas, updateDespesa } from '../despesasApi'

vi.mock('../apiClient', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('despesasApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads expenses with date params', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] })

    await expect(getDespesas('2026-01-01', '2026-01-31')).resolves.toEqual([{ id: 1 }])

    expect(api.get).toHaveBeenCalledWith('/despesas', {
      params: { startDate: '2026-01-01', endDate: '2026-01-31' },
    })
  })

  it('creates, updates and deletes expenses', async () => {
    await createDespesa({ descricao: 'Energia' })
    await updateDespesa(1, { descricao: 'Agua' })
    await deleteDespesa(1)

    expect(api.post).toHaveBeenCalledWith('/despesas', { descricao: 'Energia' })
    expect(api.put).toHaveBeenCalledWith('/despesas/1', { descricao: 'Agua' })
    expect(api.delete).toHaveBeenCalledWith('/despesas/1')
  })
})

