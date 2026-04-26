import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'

const Wrapper = styled.div`
  display:flex; min-height:100vh; background:#f9f9f9;
`
const MainArea = styled.main`flex:1; display:flex; flex-direction:column;`

const Content = styled.div`padding:32px; max-width:1280px; margin:0 auto; width:100%;`

const FormRow = styled.div`display:flex; gap:12px; margin-bottom:12px; align-items:center;`

export const PurchaseView = ({ navigate }) => {
  const [query, setQuery] = useState('')
  const [products] = useState([
    { id:1, name:'Picanha Maturatta', code:'#001', brand:'Maturatta', category:'Bovine', unit:'Kg' },
    { id:2, name:'Ribeye Premium', code:'#002', brand:'Angus', category:'Bovine', unit:'Kg' },
    { id:3, name:'Linguiça Toscana', code:'#031', brand:'Local', category:'Porcine', unit:'Kg' }
  ])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')
  const [expiry, setExpiry] = useState('')

  const [cart, setCart] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingEdit, setPendingEdit] = useState(null)

  const filtered = useMemo(() => products.filter(p => {
    const q = query.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  }), [products, query])

  const addToCart = () => {
    if (!selectedProductId || !qty || !cost) return
    const prod = products.find(p => String(p.id) === String(selectedProductId))
    const item = { id: Date.now(), product: prod.name, code: prod.code, qty: parseFloat(qty), cost: parseFloat(cost), expiry }
    setCart(prev => [item, ...prev])
    setSelectedProductId(''); setQty(''); setCost(''); setExpiry('')
  }

  const startEdit = (item) => {
    // if item older than 7 days (mock using id timestamp heuristic) show confirm
    const ageDays = (Date.now() - (item.id || 0)) / (1000*60*60*24)
    if (ageDays > 7) {
      setPendingEdit(item)
      setConfirmOpen(true)
      return
    }
    setEditing(item)
    setSelectedProductId('')
  }

  const confirmEdit = () => {
    setConfirmOpen(false)
    if (pendingEdit) setEditing(pendingEdit)
    setPendingEdit(null)
  }

  const cancelEdit = () => { setConfirmOpen(false); setPendingEdit(null) }

  const columns = [
    { header: 'Produto', key: 'product', render: i => <strong>{i.product}</strong> },
    { header: 'Código', key: 'code', render: i => <span>{i.code}</span> },
    { header: 'Qtd', key: 'qty', style:{textAlign:'right'}, render: i => <span>{i.qty}</span> },
    { header: 'Preço Custo', key: 'cost', style:{textAlign:'right'}, render: i => <span>R$ {i.cost.toFixed(2)}</span> },
    { header: 'Validade', key: 'expiry', render: i => <span>{i.expiry || '-'}</span> },
  ]

  const actions = [
    { icon: 'edit', onClick: startEdit },
    { icon: 'delete', onClick: (it) => setCart(prev => prev.filter(p => p.id !== it.id)) }
  ]

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='purchases' />
      <MainArea>
        <Topbar searchQuery={query} onSearchChange={setQuery} />
        <Content>
          <h2 style={{fontFamily:'Epilogue',fontWeight:900,color:'#610005'}}>Registro de Compra (Entrada)</h2>
          <p style={{color:'#5a403c'}}>Monte a lista de produtos comprados antes de finalizar a entrada.</p>

          <div style={{marginTop:16,marginBottom:12}}>
            <FormRow>
              <div style={{flex:1}}>
                <label style={{display:'block',fontSize:10,fontWeight:700}}>Buscar produto</label>
                <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Pesquisar por nome, código ou marca...' />
                <div style={{maxHeight:160,overflowY:'auto',marginTop:8}}>
                  {filtered.map(p=> (
                    <div key={p.id} style={{padding:8,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #f3f3f3'}}>
                      <div>
                        <div style={{fontWeight:800}}>{p.name}</div>
                        <div style={{fontSize:12,color:'#78716c'}}>{p.code} • {p.brand}</div>
                      </div>
                      <div>
                        <button onClick={() => setSelectedProductId(p.id)} style={{background:'#610005',color:'#fff',border:'none',padding:'8px 10px',borderRadius:8}}>Selecionar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{width:320}}>
                <label style={{display:'block',fontSize:10,fontWeight:700}}>Produto Selecionado</label>
                <select value={selectedProductId} onChange={(e)=>setSelectedProductId(e.target.value)} style={{width:'100%',padding:12,border:'1px solid #e7e5e4',borderRadius:8,marginBottom:8}}>
                  <option value=''>-- selecione --</option>
                  {products.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
                <Input value={qty} onChange={e=>setQty(e.target.value)} placeholder='Quantidade' />
                <Input value={cost} onChange={e=>setCost(e.target.value)} placeholder='Preço de Compra (R$)' style={{marginTop:8}} />
                <Input type='date' value={expiry} onChange={e=>setExpiry(e.target.value)} style={{marginTop:8}} />
                <Button onClick={addToCart} style={{marginTop:12}}>Adicionar à lista</Button>
              </div>
            </FormRow>
          </div>

          <DataTable data={cart} columns={columns} actions={actions} currentPage={1} totalPages={1} totalItems={cart.length} onPageChange={()=>{}} loading={false} emptyMessage='Carrinho vazio.' />

        </Content>
      </MainArea>

      <ConfirmModal open={confirmOpen} title='Editar Compra Antiga' message='Este item parece ter sido registrado há mais de 7 dias. Deseja continuar a edição?' onConfirm={confirmEdit} onCancel={cancelEdit} />
    </Wrapper>
  )
}

export default PurchaseView
