import React, { useState } from 'react'
import styled from 'styled-components'
import { Input } from './Input'
import { Button } from './Button'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`

const ModalCard = styled.div`
  width: 680px;
  max-width: calc(100% - 32px);
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
`

const Header = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 12px;
  h3{ font-family: 'Epilogue', sans-serif; font-weight:900; color:#610005; }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e7e5e4;
  font-family: 'Work Sans', sans-serif;
  font-size: 14px;
  resize: vertical;
`

export const DiscardModal = ({ open, onClose, onSubmit, products = [] }) => {
  const [form, setForm] = useState({ productId: '', qty: '', unit: 'Kg', date: '', reason: '' })

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, id: Date.now() })
    onClose()
  }

  return (
    <Backdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>Novo Descarte</h3>
          <div>
            <button onClick={onClose} aria-label='Fechar' style={{background:'none',border:'none',cursor:'pointer'}}>
              <span className='material-symbols-outlined'>close</span>
            </button>
          </div>
        </Header>

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <div>
              <label style={{fontSize:10,fontWeight:700,display:'block',marginBottom:8}}>Produto</label>
              <select name='productId' value={form.productId} onChange={handleChange} style={{width:'100%',padding:12,border:'1px solid #e7e5e4',borderRadius:8}} required>
                <option value=''>Selecione o produto...</option>
                {products.map(p => (<option key={p.id} value={p.id}>{p.name} ({p.code})</option>))}
              </select>
            </div>

            <div>
              <label style={{fontSize:10,fontWeight:700,display:'block',marginBottom:8}}>Quantidade</label>
              <Input name='qty' value={form.qty} onChange={handleChange} placeholder='0.00' required />
            </div>

            <div>
              <label style={{fontSize:10,fontWeight:700,display:'block',marginBottom:8}}>Unidade</label>
              <select name='unit' value={form.unit} onChange={handleChange} style={{width:'100%',padding:12,border:'1px solid #e7e5e4',borderRadius:8}}>
                <option>Kg</option>
                <option>Un</option>
              </select>
            </div>

            <div>
              <label style={{fontSize:10,fontWeight:700,display:'block',marginBottom:8}}>Data</label>
              <Input name='date' type='date' value={form.date} onChange={handleChange} required />
            </div>
          </FormGrid>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:700,display:'block',marginBottom:8}}>Motivo</label>
            <Textarea name='reason' value={form.reason} onChange={handleChange} placeholder='Describe the reason for discard' required />
          </div>

          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <Button variant='secondary' type='button' full={false} onClick={onClose}>Cancelar</Button>
            <Button type='submit' full={false}>Registrar Descarte</Button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  )
}

export default DiscardModal
