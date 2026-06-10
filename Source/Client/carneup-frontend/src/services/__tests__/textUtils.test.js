import { describe, expect, it, vi } from 'vitest'
import { titleCaseHandler, toSentenceCase, toTitleCase } from '../textUtils'

describe('textUtils', () => {
  it('converts text to title case', () => {
    expect(toTitleCase('contra file duplo')).toBe('Contra File Duplo')
    expect(toTitleCase('')).toBe('')
    expect(toTitleCase(null)).toBe('')
  })

  it('converts only the first character to sentence case', () => {
    expect(toSentenceCase('produto novo')).toBe('Produto novo')
    expect(toSentenceCase('')).toBe('')
  })

  it('formats input values and keeps the cursor position', () => {
    const setter = vi.fn()
    const setSelectionRange = vi.fn()
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback()
        return 1
      })

    titleCaseHandler(setter)({
      target: {
        value: 'carne moida',
        selectionStart: 5,
        setSelectionRange,
      },
    })

    expect(setter).toHaveBeenCalledWith('Carne Moida')
    expect(setSelectionRange).toHaveBeenCalledWith(5, 5)

    requestAnimationFrameSpy.mockRestore()
  })
})

