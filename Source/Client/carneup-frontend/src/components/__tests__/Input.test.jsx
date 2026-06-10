import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../Input'

describe('Input', () => {
  it('passes standard input props through', () => {
    const onChange = vi.fn()

    render(
      <Input
        aria-label="Produto"
        placeholder="Nome"
        value="Picanha"
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText('Produto')
    expect(input).toHaveValue('Picanha')
    expect(input).toHaveAttribute('placeholder', 'Nome')

    fireEvent.change(input, { target: { value: 'Alcatra' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders the dark variant without dropping custom attributes', () => {
    render(<Input aria-label="Senha" type="password" variant="dark" />)

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })
})

