import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AttributesProvider, useAttributes } from '../AttributesContext'
import * as attributesApi from '../../services/attributesApi'

vi.mock('../../services/attributesApi', () => ({
  getAllBrands: vi.fn(),
  getAllCategories: vi.fn(),
  createBrand: vi.fn(),
  updateBrand: vi.fn(),
  deleteBrand: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

const Consumer = () => {
  const {
    brands,
    categories,
    loading,
    reload,
    addBrand,
    updateBrand,
    removeBrand,
    addCategory,
    updateCategory,
    removeCategory,
  } = useAttributes()

  return (
    <section>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{brands.map(b => b.brandName).join(',')}</span>
      <span>{categories.map(c => c.categoryName).join(',')}</span>
      <button type="button" onClick={() => reload()}>reload</button>
      <button type="button" onClick={() => addBrand('Nova Marca')}>add-brand</button>
      <button type="button" onClick={() => updateBrand(1, 'Marca Editada')}>update-brand</button>
      <button type="button" onClick={() => removeBrand(1)}>delete-brand</button>
      <button type="button" onClick={() => addCategory('Nova Categoria')}>add-category</button>
      <button type="button" onClick={() => updateCategory(2, 'Categoria Editada')}>update-category</button>
      <button type="button" onClick={() => removeCategory(2)}>delete-category</button>
    </section>
  )
}

describe('AttributesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    attributesApi.getAllBrands.mockResolvedValue([{ id: 1, brandName: 'Marca A' }])
    attributesApi.getAllCategories.mockResolvedValue([{ id: 2, categoryName: 'Bovino' }])
    attributesApi.createBrand.mockResolvedValue({ data: { id: 3, brandName: 'Nova Marca' } })
    attributesApi.updateBrand.mockResolvedValue({})
    attributesApi.deleteBrand.mockResolvedValue({})
    attributesApi.createCategory.mockResolvedValue({ data: { id: 4, categoryName: 'Nova Categoria' } })
    attributesApi.updateCategory.mockResolvedValue({})
    attributesApi.deleteCategory.mockResolvedValue({})
  })

  it('loads attributes and exposes CRUD helpers that refresh the lists', async () => {
    const user = userEvent.setup()
    render(
      <AttributesProvider>
        <Consumer />
      </AttributesProvider>
    )

    expect(await screen.findByText('Marca A')).toBeInTheDocument()
    expect(screen.getByText('Bovino')).toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'reload' }))
    await user.click(screen.getByRole('button', { name: 'add-brand' }))
    await user.click(screen.getByRole('button', { name: 'update-brand' }))
    await user.click(screen.getByRole('button', { name: 'delete-brand' }))
    await user.click(screen.getByRole('button', { name: 'add-category' }))
    await user.click(screen.getByRole('button', { name: 'update-category' }))
    await user.click(screen.getByRole('button', { name: 'delete-category' }))

    await waitFor(() => expect(attributesApi.getAllBrands).toHaveBeenCalledTimes(8))
    expect(attributesApi.createBrand).toHaveBeenCalledWith('Nova Marca')
    expect(attributesApi.updateBrand).toHaveBeenCalledWith(1, 'Marca Editada')
    expect(attributesApi.deleteBrand).toHaveBeenCalledWith(1)
    expect(attributesApi.createCategory).toHaveBeenCalledWith('Nova Categoria')
    expect(attributesApi.updateCategory).toHaveBeenCalledWith(2, 'Categoria Editada')
    expect(attributesApi.deleteCategory).toHaveBeenCalledWith(2)
  })

  it('keeps the provider usable when loading fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    attributesApi.getAllBrands.mockRejectedValue(new Error('offline'))

    render(
      <AttributesProvider>
        <Consumer />
      </AttributesProvider>
    )

    await waitFor(() => expect(spy).toHaveBeenCalledWith('Failed to load attributes', expect.any(Error)))
    expect(screen.getByText('ready')).toBeInTheDocument()
    spy.mockRestore()
  })
})
