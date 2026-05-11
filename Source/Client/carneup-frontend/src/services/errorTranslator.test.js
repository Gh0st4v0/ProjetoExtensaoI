import { describe, expect, it } from 'vitest'
import translateError from './errorTranslator'

describe('translateError', () => {
  it('traduz erros de entidade vinculada', () => {
    expect(translateError({ response: { data: { message: 'brand is linked to products' } } }))
      .toBe('Não é possível excluir esta marca porque existem produtos vinculados.')

    expect(translateError({ response: { data: { message: 'categoria vinculada' } } }))
      .toBe('Não é possível excluir esta categoria porque existem produtos vinculados.')

    expect(translateError({ response: { data: { message: 'product has moviment history' } } }))
      .toBe('Não é possível excluir este produto porque existem movimentações associadas.')
  })

  it('usa mensagens padronizadas para status HTTP conhecidos', () => {
    expect(translateError({ response: { status: 404 } })).toBe('Recurso não encontrado.')
    expect(translateError({ response: { status: 409 } })).toBe('Conflito: recurso já existe.')
    expect(translateError({ response: { status: 422 } })).toBe('Operação não permitida.')
  })

  it('nao expoe mensagens inesperadas do backend', () => {
    expect(translateError({ message: 'unexpected backend failure' }))
      .toBe('Falha ao processar a solicitação. Tente novamente.')
  })
})
