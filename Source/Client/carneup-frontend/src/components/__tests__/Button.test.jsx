import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children and calls onClick', () => {
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Salvar</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports disabled and type props', () => {
    const onClick = vi.fn()

    render(
      <Button disabled type="submit" onClick={onClick}>
        Enviar
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Enviar' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})

