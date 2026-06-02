import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from './Button'

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:60;
`
const ModalCard = styled.div`
  width: 520px; max-width: calc(100% - 32px); background:#fff; border-radius:12px; padding:18px; box-shadow:0 20px 40px rgba(0,0,0,0.12);
`
const Header = styled.div`display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;`
const Label = styled.label`display:block; font-size:12px; color:#5a403c; margin-bottom:6px; font-weight:700; text-transform:uppercase;`
const Input = styled.input`width:100%; padding:10px; border:1px solid #e7e5e4; border-radius:8px; font-size:14px;`

export const DespesaModal = ({ open, onClose, onSubmit }) => {
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (open) { setDescricao(''); setCategoria(''); setValor(''); setDate(new Date().toISOString().slice(0,10)); setSubmitting(false) } }, [open])
  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!descricao || !valor) return
    setSubmitting(true)
    try {
      await onSubmit({ descricao, categoria, valor: Number(valor), dataDespesa: date })
      onClose()
    } catch (err) {
      // let parent handle errors
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Backdrop onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <h3 style={{ margin: 0, fontFamily: 'Epilogue', fontWeight:900, color:'#610005' }}>Nova Despesa</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </Header>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <Label>Descrição *</Label>
            <Input value={descricao} onChange={e => setDescricao(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Categoria</Label>
            <Input value={categoria} onChange={e => setCategoria(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <Label>Valor (R$) *</Label>
              <Input type='number' step='0.01' value={valor} onChange={e => setValor(e.target.value)} required />
            </div>
            <div style={{ width: 160 }}>
              <Label>Data</Label>
              <Input type='date' value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant='secondary' type='button' full={false} onClick={onClose}>Cancelar</Button>
            <Button type='submit' full={false} disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar Despesa'}</Button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  )
}
export default DespesaModal
