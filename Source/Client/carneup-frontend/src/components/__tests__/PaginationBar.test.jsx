import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PaginationBar from '../PaginationBar'

describe('PaginationBar', () => {
  it('does not render when there is only one page', () => {
    const { container } = render(
      <PaginationBar page={1} totalPages={1} totalItems={3} onPageChange={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows page info and calls onPageChange for page buttons', () => {
    const onPageChange = vi.fn()

    render(
      <PaginationBar page={3} totalPages={5} totalItems={42} onPageChange={onPageChange} />,
    )

    expect(screen.getByText(/42 itens/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 2)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4)
  })

  it('disables previous on the first page and next on the last page', () => {
    const { rerender } = render(
      <PaginationBar page={1} totalPages={3} totalItems={30} onPageChange={vi.fn()} />,
    )

    expect(screen.getAllByRole('button')[0]).toBeDisabled()

    rerender(<PaginationBar page={3} totalPages={3} totalItems={30} onPageChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()
  })
})

