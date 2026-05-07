import React, { useState, useEffect } from 'react'
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

export default function QuickCreateModal({ open, type, onClose, onCreate, initialValue }) {
  const isEditMode = initialValue !== undefined && initialValue !== null
  const [value, setValue] = useState(initialValue ?? '')
  const [confirmStage, setConfirmStage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setValue(initialValue ?? '')
    setConfirmStage(false)
    setError(null)
  }, [open, initialValue])

  if (!open) return null

  const label = type === 'brand' ? (isEditMode ? 'Editar Marca' : 'Nova Marca') : (isEditMode ? 'Editar Categoria' : 'Nova Categoria')
  const placeholder = type === 'brand' ? 'Ex: PrimeCuts' : 'Ex: Seafood'

  const handlePrimary = async () => {
    if (!value || value.trim().length < 2) return

    if (isEditMode && !confirmStage) {
      setConfirmStage(true)
      return
    }

    try {
      setLoading(true)
      await onCreate(value.trim())
      setValue('')
      setConfirmStage(false)
      setError(null)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Falha ao processar')
    } finally {
      setLoading(false)
    }
  }

  const handleBackFromConfirm = () => setConfirmStage(false)

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <h3 style={{fontFamily:"Epilogue, sans-serif",color:'#610005',fontWeight:900}}>{label}</h3>
        {confirmStage ? (
          <div style={{marginTop:12}}>
            <p style={{marginTop:0,color:'#5a403c'}}>Alterar o nome irá influenciar o histórico de vendas. Tem certeza que deseja prosseguir?</p>
            {error && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{error}</div>}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <Button variant='secondary' type='button' full={false} onClick={handleBackFromConfirm}>Voltar</Button>
              <Button type='button' full={false} onClick={handlePrimary} disabled={loading}>{loading ? 'Confirmando...' : 'Confirmar alteração'}</Button>
            </div>
          </div>
        ) : (
          <div style={{marginTop:12}}>
            <Input label={isEditMode ? 'Novo nome' : label} name='quick' value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
            {error && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{error}</div>}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <Button variant='secondary' type='button' full={false} onClick={onClose}>Cancelar</Button>
              <Button type='button' full={false} onClick={handlePrimary}>{isEditMode ? 'Editar' : 'Criar'}</Button>
            </div>
          </div>
        )}
      </Card>
    </Backdrop>
  )
}
