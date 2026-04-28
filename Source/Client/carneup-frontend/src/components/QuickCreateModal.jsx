import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { Input } from './Input'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:70;
`

const Card = styled.div`
  width:420px;
  max-width: calc(100% - 32px);
  background: #fff;
  border-radius:12px;
  padding:20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
`

export default function QuickCreateModal({ open, type, onClose, onCreate }) {
  const [value, setValue] = useState('')
  if (!open) return null

  const label = type === 'brand' ? 'Nova Marca' : 'Nova Categoria'
  const placeholder = type === 'brand' ? 'Ex: PrimeCuts' : 'Ex: Seafood'
n  const handleCreate = () => {
    if (!value || value.trim().length < 2) return
    onCreate(value.trim())
    setValue('')
  }

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <h3 style={{fontFamily:"Epilogue, sans-serif",color:'#610005',fontWeight:900}}>{label}</h3>
        <div style={{marginTop:12}}>
          <Input label={label} name='quick' value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
            <Button variant='secondary' type='button' full={false} onClick={onClose}>Cancelar</Button>
            <Button type='button' full={false} onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </Card>
    </Backdrop>
  )
}
