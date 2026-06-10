import { describe, expect, it } from 'vitest'
import translateError from '../errorTranslator'

describe('translateError', () => {
  it('returns friendly messages for linked entities', () => {
    expect(translateError({ response: { data: { message: 'brand linked to product' } } })).toContain('marca')
    expect(translateError({ response: { data: { message: 'category linked to product' } } })).toContain('categoria')
    expect(translateError({ response: { data: { message: 'product has movimentacao' } } })).toContain('produto')
  })

  it('uses HTTP status fallbacks', () => {
    expect(translateError({ response: { status: 404 } })).toContain('Recurso')
    expect(translateError({ response: { status: 409 } })).toContain('Conflito')
    expect(translateError({ response: { status: 422 } })).toContain('Opera')
  })

  it('recognizes common backend message patterns', () => {
    expect(translateError({ message: 'Product already exists' })).toContain('existe')
    expect(translateError({ message: 'Client not found' })).toContain('Recurso')
  })

  it('hides unknown backend errors behind a generic message', () => {
    expect(translateError({ message: 'database stack trace' })).toContain('Falha')
    expect(translateError(null)).toContain('Falha')
  })
})

