import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'
import productsApi from '../services/productsApi'
import purchasesApi from '../services/purchasesApi'

const Wrapper = styled.div`
  display:flex; min-height:100vh; background:#f9f9f9;
`
const MainArea = styled.main`flex:1; display:flex; flex-direction:column;`

const Content = styled.div`padding:32px; max-width:1280px; margin:0 auto; width:100%;`

const FormRow = styled.div`display:flex; gap:12px; margin-bottom:12px; align-items:center;`

export const PurchaseView = ({ navigate }) => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')
  const [expiry, setExpiry] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0,10))

  const [cart, setCart] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingEdit, setPendingEdit] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productsApi.getAllProducts(0)
        // normalize response to expected fields (page.content)
        const list = (res?.content || []).map(p => ({ id: p.id, name: p.name || p.product_name || p.productName, code: p.code || p.codigo, brand: p.brandName || p.brand_name || '', category: p.categoryName || '', unit: p.unitMeasurement || 'UN', perecivel: p.perecivel }))
        setProducts(list)
      } catch (e) {
        console.error('Falha ao carregar produtos', e)
      }
    }
    fetch()
  }, [])

  const filtered = useMemo(() => products.filter(p => {
    const q = query.toLowerCase()
    return !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q)) || (p.brand && p.brand.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q))
  }), [products, query])

  const addToCart = () => {
    if (!selectedProductId || !qty || !cost) return
    const prod = products.find(p => String(p.id) === String(selectedProductId))
    const itemData = { id: Date.now(), productId: prod.id, productName: prod.name, code: prod.code, qty: parseFloat(qty), cost: parseFloat(cost), expiry }

    if (editing) {
      setCart(prev => prev.map(it => it.id === editing.id ? { ...it, ...itemData } : it))
      setEditing(null)
    } else {
      setCart(prev => [itemData, ...prev])
    }

    setSelectedProductId(''); setQty(''); setCost(''); setExpiry('')
  }

  const startEdit = (item) => {
    const ageDays = (Date.now() - (item.id || 0)) / (1000*60*60*24)
    if (ageDays > 7) {
      setPendingEdit(item)
      setConfirmOpen(true)
      return
    }
    setEditing(item)
    setSelectedProductId(item.productId)
    setQty(String(item.qty))
    setCost(String(item.cost))
    setExpiry(item.expiry || '')
  }

  const confirmEdit = () => {
    setConfirmOpen(false)
    if (pendingEdit) startEdit(pendingEdit)
    setPendingEdit(null)
  }

  const cancelEdit = () => { setConfirmOpen(false); setPendingEdit(null) }

  const columns = [
    { header: 'Produto', key: 'product', render: i => <strong>{i.productName}</strong> },
    { header: 'Código', key: 'code', render: i => <span>{i.code}</span> },
    { header: 'Qtd', key: 'qty', style:{textAlign:'right'}, render: i => <span>{i.qty}</span> },
    { header: 'Preço Custo', key: 'cost', style:{textAlign:'right'}, render: i => <span>R$ {Number(i.cost).toFixed(2)}</span> },
    { header: 'Validade', key: 'expiry', render: i => <span>{i.expiry || '-'}</span> },
  ]

  const actions = [
    { icon: 'edit', onClick: startEdit },
    { icon: 'delete', onClick: (it) => setCart(prev => prev.filter(p => p.id !== it.id)) }
  ]

  const handleSubmitPurchase = async () => {
    if (!cart.length) return alert('Adicione ao menos um item ao carrinho')
    const payload = {
      date: purchaseDate,
      items: cart.map(it => ({ productId: Number(it.productId), quantity: it.qty, unitPurchasePrice: it.cost, expiringDate: it.expiry || null }))
    }
    try {
      await purchasesApi.createPurchase(payload)
      alert('Compra registrada com sucesso')
      setCart([])
    } catch (e) {
      console.error('Erro ao registrar compra', e)
      alert(e?.response?.data?.message || 'Falha ao registrar compra')
    }
  }

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
                <label style={{display:'block',fontSize:10,fontWeight:700}}>Data da Compra</label>
                <Input type='date' value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)} style={{marginBottom:8}} />
                <label style={{display:'block',fontSize:10,fontWeight:700,marginTop:8}}>Produto Selecionado</label>
                <select value={selectedProductId} onChange={(e)=>setSelectedProductId(e.target.value)} style={{width:'100%',padding:12,border:'1px solid #e7e5e4',borderRadius:8,marginBottom:8}}>
                  <option value=''>-- selecione --</option>
                  {products.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
                <Input value={qty} onChange={e=>setQty(e.target.value)} placeholder='Quantidade' />
                <Input value={cost} onChange={e=>setCost(e.target.value)} placeholder='Preço de Compra (R$)' style={{marginTop:8}} />
                <Input type='date' value={expiry} onChange={e=>setExpiry(e.target.value)} style={{marginTop:8}} />
                <Button onClick={addToCart} style={{marginTop:12}}>{editing ? 'Atualizar item' : 'Adicionar à lista'}</Button>
              </div>
            </FormRow>
          </div>

          <DataTable data={cart} columns={columns} actions={actions} currentPage={1} totalPages={1} totalItems={cart.length} onPageChange={()=>{}} loading={false} emptyMessage='Carrinho vazio.' />

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <Button onClick={handleSubmitPurchase} disabled={!cart.length}>Finalizar Compra</Button>
          </div>

        </Content>
      </MainArea>

      <ConfirmModal open={confirmOpen} title='Editar Compra Antiga' message='Este item parece ter sido registrado há mais de 7 dias. Deseja continuar a edição?' onConfirm={confirmEdit} onCancel={cancelEdit} />
    </Wrapper>
  )
}

export default PurchaseView
