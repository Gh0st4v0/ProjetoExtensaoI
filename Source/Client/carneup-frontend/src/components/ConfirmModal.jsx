import React from 'react'
import styled from 'styled-components'
import { Button } from './Button'

const Backdrop = styled.div`
  position: fixed; inset:0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:70;
`
const Card = styled.div`
  background:#fff; padding:20px; border-radius:10px; width:420px; box-shadow:0 12px 30px rgba(0,0,0,0.12);
`

export const ConfirmModal = ({ open, title='Confirmar', message, onConfirm, onCancel }) => {
  if (!open) return null
  return (
    <Backdrop>
      <Card>
        <h3 style={{margin:0,color:'#610005',fontFamily:'Epilogue',fontWeight:900}}>{title}</h3>
        <p style={{marginTop:12,color:'#5a403c'}}>{message}</p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:16}}>
          <Button variant='secondary' full={false} onClick={onCancel}>Cancelar</Button>
          <Button full={false} onClick={onConfirm}>Confirmar</Button>
        </div>
      </Card>
    </Backdrop>
  )
}

export default ConfirmModal
