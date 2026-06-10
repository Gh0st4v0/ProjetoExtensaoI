import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ConfirmModal from '../ConfirmModal'

describe('ConfirmModal', () => {
  it('does not render when closed', () => {
    render(<ConfirmModal open={false} message="Excluir produto?" />)

    expect(screen.queryByText('Excluir produto?')).not.toBeInTheDocument()
  })

  it('renders content and handles actions', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmModal
        open
        title="Excluir"
        message="Excluir produto?"
        confirmLabel="Excluir"
        error="Erro ao excluir"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Excluir' })).toBeInTheDocument()
    expect(screen.getByText('Excluir produto?')).toBeInTheDocument()
    expect(screen.getByText('Erro ao excluir')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables confirmation while loading', () => {
    const onConfirm = vi.fn()

    render(<ConfirmModal open loading message="Aguarde" onConfirm={onConfirm} />)

    const confirmButton = screen.getByRole('button', { name: '...' })
    expect(confirmButton).toBeDisabled()

    fireEvent.click(confirmButton)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

