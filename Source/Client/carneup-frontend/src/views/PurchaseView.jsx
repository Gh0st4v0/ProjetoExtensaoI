import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import NumberField, { parseLocaleNumber } from '../components/NumberField'
import DataTable from '../components/DataTable'
import ConfirmModal from '../components/ConfirmModal'
import productsApi from '../services/productsApi'
import purchasesApi from '../services/purchasesApi'
import AlertModal from '../components/AlertModal'

const Wrapper = styled.div`
  display:flex; min-height:100vh; background:#f9f9f9;
`
const MainArea = styled.main`flex:1; display:flex; flex-direction:column; min-width:0;`

const Content = styled.div`
  padding:32px;
  max-width:1360px;
  margin:0 auto;
  width:100%;
  display:flex;
  flex-direction:column;
  gap:24px;
`

const EntryPanel = styled.section`
  display:grid;
  grid-template-columns:minmax(0, 1fr);
  gap:20px;
  align-items:start;

  @media (min-width: 1100px) {
    grid-template-columns:minmax(0, 1fr) 360px;
  }
`

const ProductSearchPanel = styled.div`
  background:#ffffff;
  border:1px solid #eeeeee;
  border-radius:4px;
  padding:16px;
  box-shadow:0 1px 2px rgba(0,0,0,0.05);
`

const ProductList = styled.div`
  max-height:380px;
  overflow-y:auto;
  margin-top:12px;
  border:1px solid #eeeeee;
  border-radius:4px;
`

const ProductRow = styled.button`
  width:100%;
  padding:12px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  border:0;
  border-bottom:1px solid #f3f3f3;
  background:${(props) => props.$selected ? '#fff8f7' : '#ffffff'};
  text-align:left;
  cursor:pointer;

  &:last-child {
    border-bottom:0;
  }

  &:hover {
    background:#fff8f7;
  }

  strong {
    display:block;
    font-family:'Epilogue', sans-serif;
    font-size:14px;
    color:#1a1c1c;
  }

  span {
    display:block;
    margin-top:3px;
    font-size:12px;
    color:#78716c;
  }

  .material-symbols-outlined {
    margin-top:0;
    font-size:20px;
    color:#8a040d;
    flex-shrink:0;
  }
`

const EntryForm = styled.div`
  background:#ffffff;
  border:1px solid #eeeeee;
  border-radius:4px;
  padding:16px;
  box-shadow:0 1px 2px rgba(0,0,0,0.05);
`

const FieldGroup = styled.label`
  display:block;
  font-size:10px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.08em;
  color:#5a403c;
  margin-top:${(props) => props.$compact ? '0' : '12px'};
`

const SelectField = styled.select`
  width:100%;
  margin-top:6px;
  padding:12px 14px;
  border:1px solid #e7e5e4;
  border-radius:10px;
  background:#ffffff;
  color:#1a1c1c;
  font-size:14px;
  outline:none;

  &:focus {
    border-color:#610005;
    box-shadow:0 6px 18px rgba(97,0,5,0.06);
  }
`

const PageHeader = styled.div`
  display:flex;
  flex-direction:column;
  gap:16px;

  @media (min-width: 768px) {
    flex-direction:row;
    justify-content:space-between;
    align-items:flex-end;
  }

  h2 {
    font-family:'Epilogue', sans-serif;
    font-size:28px;
    font-weight:900;
    color:#610005;
    text-transform:uppercase;
    margin:0;
  }

  p {
    color:#5a403c;
    font-size:14px;
    margin-top:4px;
  }
`

const HistoryCard = styled.section`
  background:#ffffff;
  border:1px solid #eeeeee;
  border-radius:4px;
  box-shadow:0 1px 2px rgba(0,0,0,0.05);
  padding:16px;

  h3 {
    margin:0 0 12px;
    font-family:'Epilogue', sans-serif;
    font-size:16px;
    font-weight:900;
    color:#610005;
    text-transform:uppercase;
  }
`

const getTodayInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10)
}

export const PurchaseView = ({ navigate }) => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')
  const [expiry, setExpiry] = useState('')
  const today = getTodayInputValue()
  const [purchaseDate, setPurchaseDate] = useState(today)

  const [cart, setCart] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [alertState, setAlertState] = useState({ open: false })
  const [purchaseHistory, setPurchaseHistory] = useState([])

  const showAlert = ({ title = 'Aviso', message, tone = 'info' }) => {
    setAlertState({ open: true, title, message, tone })
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productsApi.getAllProductsList()
        const list = (res || []).map(p => ({ id: p.id, name: p.name || p.product_name || p.productName, code: p.code || p.codigo, brand: p.brandName || p.brand_name || '', category: p.categoryName || '', unit: p.unitMeasurement || 'UN', perecivel: p.perecivel }))
        setProducts(list)
      } catch (e) {
        console.error('Falha ao carregar produtos', e)
      }
    }
    fetch()
  }, [])

  const loadPurchases = async () => {
    try {
      const page = await purchasesApi.getPurchases(0)
      setPurchaseHistory(page?.content || [])
    } catch (e) {
      console.error('Falha ao carregar compras', e)
      setPurchaseHistory([])
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  const filtered = useMemo(() => products.filter(p => {
    const q = query.toLowerCase()
    return !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q)) || (p.brand && p.brand.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q))
  }), [products, query])

  const selectedProduct = useMemo(
    () => products.find(p => String(p.id) === String(selectedProductId)),
    [products, selectedProductId]
  )

  const parseDecimal = (value) => {
    return parseLocaleNumber(value)
  }

  const selectProduct = (id) => {
    const product = products.find(p => String(p.id) === String(id))
    setSelectedProductId(id)
    if (!product?.perecivel) setExpiry('')
  }

  const addToCart = () => {
    if (!selectedProduct) {
      showAlert({ title: 'Produto obrigatório', message: 'Selecione um produto antes de adicionar.' })
      return
    }

    const parsedQty = parseDecimal(qty)
    if (parsedQty === null || parsedQty <= 0) {
      showAlert({ title: 'Quantidade inválida', message: 'Informe uma quantidade maior que zero.' })
      return
    }

    if (selectedProduct.unit === 'UN' && !Number.isInteger(parsedQty)) {
      showAlert({ title: 'Quantidade inválida', message: 'Produtos em unidade devem ter quantidade inteira.' })
      return
    }

    const parsedCost = parseDecimal(cost)
    if (parsedCost === null || parsedCost <= 0) {
      showAlert({ title: 'Preço inválido', message: 'Informe um preço de compra maior que zero.' })
      return
    }

    if (selectedProduct.perecivel && !expiry) {
      showAlert({ title: 'Validade obrigatória', message: 'Informe a validade para produtos perecíveis.' })
      return
    }

    if (expiry && expiry < today) {
      showAlert({ title: 'Validade inválida', message: 'A validade não pode ser anterior à data de hoje.' })
      return
    }

    const itemData = {
      id: editing?.id || Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      code: selectedProduct.code,
      qty: parsedQty,
      cost: parsedCost,
      expiry: selectedProduct.perecivel ? expiry : null,
    }

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
    selectProduct(item.productId)
    setQty(String(item.qty))
    setCost(Number(item.cost).toFixed(2).replace('.', ','))
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
    { header: 'Qtd', key: 'qty', style:{textAlign:'right'}, render: i => <span>{Number(i.qty).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</span> },
    { header: 'Preço Custo', key: 'cost', style:{textAlign:'right'}, render: i => <span>{Number(i.cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> },
    { header: 'Validade', key: 'expiry', render: i => <span>{i.expiry || '-'}</span> },
  ]

  const actions = [
    { icon: 'edit', onClick: startEdit },
    { icon: 'delete', onClick: (it) => setCart(prev => prev.filter(p => p.id !== it.id)) }
  ]

  const handleSubmitPurchase = async () => {
    if (!cart.length) return showAlert({ title: 'Carrinho vazio', message: 'Adicione ao menos um item ao carrinho.' })
    const payload = {
      date: purchaseDate,
      items: cart.map(it => ({ productId: Number(it.productId), quantity: it.qty, unitPurchasePrice: it.cost, expiringDate: it.expiry || null }))
    }
    try {
      await purchasesApi.createPurchase(payload)
      showAlert({ title: 'Compra registrada', message: 'Compra registrada com sucesso.', tone: 'success' })
      setCart([])
      await loadPurchases()
    } catch (e) {
      console.error('Erro ao registrar compra', e)
      showAlert({ title: 'Falha ao registrar compra', message: e?.response?.data?.message || 'Falha ao registrar compra' })
    }
  }

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='purchases' />
      <MainArea>
        <Topbar title='Registro de Compra' />
        <Content>
          <PageHeader>
            <div>
              <h2>Registro de Compra (Entrada)</h2>
              <p>Monte a lista de produtos comprados antes de finalizar a entrada.</p>
            </div>
          </PageHeader>

          <EntryPanel>
              <ProductSearchPanel>
                <FieldGroup $compact>Buscar produto</FieldGroup>
                <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Pesquisar por nome, código ou marca...' style={{marginTop:6}} />
                <ProductList>
                  {filtered.map(p=> (
                    <ProductRow key={p.id} type='button' $selected={String(selectedProductId) === String(p.id)} onClick={() => selectProduct(p.id)}>
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.code} • {p.brand || 'Sem marca'} • {p.perecivel ? 'Perecível' : 'Não perecível'}</span>
                      </div>
                      <span className='material-symbols-outlined'>chevron_right</span>
                    </ProductRow>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{padding:16,color:'#78716c'}}>Nenhum produto encontrado.</div>
                  )}
                </ProductList>
              </ProductSearchPanel>

              <EntryForm>
                <FieldGroup $compact>Data da Compra</FieldGroup>
                <Input type='date' value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)} style={{marginTop:6}} />
                <FieldGroup>Produto Selecionado</FieldGroup>
                <SelectField value={selectedProductId} onChange={(e)=>selectProduct(e.target.value)}>
                  <option value=''>-- selecione --</option>
                  {products.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </SelectField>
                <NumberField
                  label='Quantidade'
                  value={qty}
                  onChange={e=>setQty(e.target.value)}
                  suffix={selectedProduct?.unit}
                  placeholder={selectedProduct?.unit === 'UN' ? '0' : '0,000'}
                  decimals={selectedProduct?.unit === 'UN' ? 0 : 3}
                  integer={selectedProduct?.unit === 'UN'}
                />
                <NumberField
                  label='Preço de Compra'
                  value={cost}
                  onChange={e=>setCost(e.target.value)}
                  prefix='R$'
                  placeholder='0,00'
                  decimals={2}
                  currencyMask
                />
                {selectedProduct?.perecivel && (
                  <>
                    <FieldGroup>Validade</FieldGroup>
                    <Input type='date' value={expiry} min={today} onChange={e=>setExpiry(e.target.value)} style={{marginTop:6}} />
                  </>
                )}
                <Button onClick={addToCart} style={{marginTop:12}}>{editing ? 'Atualizar item' : 'Adicionar à lista'}</Button>
              </EntryForm>
          </EntryPanel>

          <DataTable data={cart} columns={columns} actions={actions} currentPage={1} totalPages={1} totalItems={cart.length} onPageChange={()=>{}} loading={false} emptyMessage='Carrinho vazio.' />

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <Button onClick={handleSubmitPurchase} disabled={!cart.length}>Finalizar Compra</Button>
          </div>

          <HistoryCard>
            <h3>Compras Recentes</h3>
            <DataTable
              data={purchaseHistory}
              columns={[
                { header: 'ID', key: 'id', render: i => <strong>#{i.id}</strong> },
                { header: 'Data', key: 'date', render: i => <span>{i.date || '-'}</span> },
                { header: 'Itens', key: 'items', render: i => <span>{(i.items || []).length}</span> },
                { header: 'Total', key: 'totalValue', style:{textAlign:'right'}, render: i => <span>{Number(i.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> },
              ]}
              currentPage={1}
              totalPages={1}
              totalItems={purchaseHistory.length}
              onPageChange={()=>{}}
              loading={false}
              emptyMessage='Nenhuma compra registrada.'
            />
          </HistoryCard>

        </Content>
      </MainArea>

      <ConfirmModal open={confirmOpen} title='Editar Compra Antiga' message='Este item parece ter sido registrado há mais de 7 dias. Deseja continuar a edição?' onConfirm={confirmEdit} onCancel={cancelEdit} />
      <AlertModal
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        tone={alertState.tone}
        onClose={() => setAlertState({ open: false })}
      />
    </Wrapper>
  )
}

export default PurchaseView
