import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { getStockLots } from '../services/discardApi'

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
  width: 720px;
  max-width: calc(100% - 32px);
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  max-height: 90vh;
  overflow-y: auto;
`
const Header = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 16px;
  h3{ font-family: 'Epilogue', sans-serif; font-weight:900; color:#610005; font-size:20px; }
`
const Label = styled.label`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5a403c;
  display: block;
  margin-bottom: 6px;
`
const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 14px;
  background: #fff;
`
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 14px;
`
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`
const LotBox = styled.div`
  background: #f9f9f9;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #5a403c;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`
const ErrorMsg = styled.p`
  color: #ba1a1a;
  font-size: 12px;
  margin-top: 4px;
`

const TYPES = [
  { value: 'VENCIMENTO', label: 'Vencimento' },
  { value: 'DANO', label: 'Dano / Avaria' },
  { value: 'ROUBO', label: 'Roubo' },
  { value: 'PERDA_PESO', label: 'Perda de Peso' },
  { value: 'CONSUMO_PESSOAL', label: 'Consumo Pessoal' },
  { value: 'OUTRO', label: 'Outro' },
]

export const DiscardModal = ({ open, onClose, onSubmit }) => {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState('VENCIMENTO')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLoading(true)
      getStockLots()
        .then(setProducts)
        .catch(() => setProducts([]))
        .finally(() => setLoading(false))
      setSelectedProductId('')
      setSelectedPurchaseId('')
      setQuantity('')
      setType('VENCIMENTO')
      setDate(new Date().toISOString().slice(0, 10))
      setError('')
    }
  }, [open])

  if (!open) return null

  const selectedProduct = products.find(p => String(p.id) === String(selectedProductId))
  const lots = selectedProduct ? selectedProduct.purchases : []
  const selectedLot = lots.find(l => String(l.purchase_id) === String(selectedPurchaseId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedProductId || !selectedPurchaseId || !quantity) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        date,
        type,
        items: [{ purchaseId: Number(selectedPurchaseId), productId: Number(selectedProductId), quantity: parseFloat(quantity) }],
      })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao registrar descarte.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Backdrop onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <h3>Novo Descarte</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </Header>

        <form onSubmit={handleSubmit}>
          <Grid2>
            <div>
              <Label>Produto *</Label>
              {loading ? <p style={{ fontSize: 13, color: '#78716c' }}>Carregando...</p> : (
                <Select value={selectedProductId} onChange={e => { setSelectedProductId(e.target.value); setSelectedPurchaseId('') }} required>
                  <option value=''>Selecione o produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name} ({p.code})</option>
                  ))}
                </Select>
              )}
            </div>

            <div>
              <Label>Lote / Compra *</Label>
              <Select value={selectedPurchaseId} onChange={e => setSelectedPurchaseId(e.target.value)} required disabled={!selectedProductId}>
                <option value=''>Selecione o lote...</option>
                {lots.map(l => (
                  <option key={l.purchase_id} value={l.purchase_id}>
                    Compra #{l.purchase_id} — {l.quantity} {selectedProduct?.unitMeasurement}
                    {l.expiring_date ? ` — Vence: ${l.expiring_date}` : ''}
                  </option>
                ))}
              </Select>
            </div>
          </Grid2>

          {selectedLot && (
            <LotBox>
              <span><strong>Disponível:</strong> {selectedLot.quantity} {selectedProduct?.unitMeasurement}</span>
              {selectedLot.expiring_date && <span><strong>Validade:</strong> {selectedLot.expiring_date}</span>}
              <span><strong>Data compra:</strong> {selectedLot.purchase_date}</span>
            </LotBox>
          )}

          <Grid2>
            <div>
              <Label>Quantidade a descartar *</Label>
              <Input type='number' value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder='0.000' step='0.001' min='0.001'
                max={selectedLot ? selectedLot.quantity : undefined} required />
            </div>
            <div>
              <Label>Tipo / Motivo *</Label>
              <Select value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
          </Grid2>

          <div style={{ marginBottom: 16 }}>
            <Label>Data do Descarte</Label>
            <Input type='date' value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant='secondary' type='button' full={false} onClick={onClose}>Cancelar</Button>
            <Button type='submit' full={false} disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar Descarte'}
            </Button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  )
}

export default DiscardModal
