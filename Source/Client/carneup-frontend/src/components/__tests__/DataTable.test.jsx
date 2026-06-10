import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DataTable from '../DataTable'

const columns = [
  { header: 'Nome', key: 'name' },
  { header: 'Preco', render: (item) => `R$ ${item.price}` },
]

describe('DataTable', () => {
  it('renders rows, custom cells, toolbar actions and row actions', () => {
    const rowAction = vi.fn()

    render(
      <DataTable
        data={[{ id: 1, name: 'Picanha', price: 40 }]}
        columns={columns}
        actions={[{ icon: 'edit', onClick: rowAction }]}
        toolbarActions={<button type="button">Novo</button>}
        currentPage={1}
        totalPages={1}
        totalItems={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByText('1 Itens encontrados')).toBeInTheDocument()
    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('Picanha')).toBeInTheDocument()
    expect(screen.getByText('R$ 40')).toBeInTheDocument()

    fireEvent.click(screen.getByText('edit').closest('button'))
    expect(rowAction).toHaveBeenCalledWith({ id: 1, name: 'Picanha', price: 40 })
  })

  it('renders loading and empty states', () => {
    const { rerender } = render(
      <DataTable
        data={[]}
        columns={columns}
        currentPage={1}
        totalPages={1}
        totalItems={0}
        onPageChange={vi.fn()}
        loading
      />,
    )

    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()

    rerender(
      <DataTable
        data={[]}
        columns={columns}
        currentPage={1}
        totalPages={1}
        totalItems={0}
        onPageChange={vi.fn()}
        emptyMessage="Nada encontrado"
      />,
    )

    expect(screen.getByText('Nada encontrado')).toBeInTheDocument()
  })

  it('renders pagination and changes pages', () => {
    const onPageChange = vi.fn()

    render(
      <DataTable
        data={[{ id: 1, name: 'Picanha', price: 40 }]}
        columns={columns}
        currentPage={2}
        totalPages={3}
        totalItems={25}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getByText(/Exibindo 11 de 20 de 25 itens/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })
})

