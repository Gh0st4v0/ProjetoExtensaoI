import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/Button'
import DataTable from '../components/DataTable'
import productsApi from '../services/productsApi'
import purchasesApi from '../services/purchasesApi'
import { toast } from 'react-toastify'

// ── Styles ────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: 'Work Sans', sans-serif;
`
const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`
const Content = styled.div`
  padding: 24px 16px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 768px) { padding: 32px 24px; }
`
const PageTitle = styled.h2`
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  color: #610005;
  text-transform: uppercase;
  font-size: clamp(20px, 4vw, 28px);
  margin: 0 0 4px;
`
const PageDesc = styled.p`
  color: #5a403c;
  margin: 0 0 24px;
  font-size: 14px;
`
const Grid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) { grid-template-columns: 1fr 1fr; }
  margin-bottom: 24px;
`
const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`
const CardTitle = styled.h3`
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  color: #610005;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`
const Field = styled.div`
  margin-bottom: 14px;
`
const Label = styled.label`
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5a403c;
  margin-bottom: 5px;
`
const LabelHint = styled.span`
  font-weight: 400;
  color: #78716c;
  font-size: 10px;
  margin-left: 4px;
`
const InputBase = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${p => p.$error ? '#ba1a1a' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Work Sans', sans-serif;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #610005; }
  background: ${p => p.disabled ? '#f9f9f9' : '#fff'};
`
const SelectBase = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${p => p.$error ? '#ba1a1a' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Work Sans', sans-serif;
  background: #fff;
`
const ErrorHint = styled.p`
  color: #ba1a1a;
  font-size: 11px;
  margin: 4px 0 0;
`
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`
const AddBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #610005;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 4px;
  &:hover { background: #7f1d1d; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`
const SearchResult = styled.div`
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-top: 6px;
`
const ProductRow = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover { background: #fef2f2; }
  &:last-child { border-bottom: none; }
  .name { font-weight: 700; font-size: 13px; }
  .sub { font-size: 11px; color: #78716c; }
`
const SelectBtn = styled.button`
  background: #610005;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #7f1d1d; }
`
const SelectedBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef2f2;
  border: 1px solid #ffdad6;
  border-radius: 8px;
  padding: 10px 14px;
  .name { font-weight: 700; font-size: 14px; color: #610005; }
  .sub { font-size: 11px; color: #78716c; }
`
const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #78716c;
  &:hover { color: #ba1a1a; }
`
const PerishableTag = styled.span`
  display: inline-block;
  background: #fff3cd;
  color: #b45309;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
`
const TableWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  margin-bottom: 16px;
`
const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

// ── Component ─────────────────────────────────────────────────────────────────

export const PurchaseView = ({ navigate }) => {
  const [allProducts, setAllProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')
  const [expiry, setExpiry] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))

  const [cart, setCart] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Load all products
  useEffect(() => {
    productsApi.getAllProducts(0)
      .then(res => setAllProducts((res?.content || []).map(p => ({
        id: p.id,
        name: p.name || '',
        code: p.code || '',
        brand: p.brandName || '',
        unit: p.unitMeasurement || 'UN',
        perecivel: p.perecivel,
      }))))
      .catch(() => toast.error('Erro ao carregar produtos.'))
  }, [])

  const filtered = allProducts.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  })

  // ── Validação do formulário de item ──────────────────────────────────────────

  const validate = () => {
    const e = {}
    if (!selected) e.product = 'Selecione um produto.'
    const parsedQty = parseFloat(qty)
    if (!qty || isNaN(parsedQty) || parsedQty <= 0) e.qty = 'Informe uma quantidade maior que zero.'
    if (selected?.unit === 'UN' && !Number.isInteger(parsedQty)) e.qty = 'Produtos UN exigem quantidade inteira.'
    const parsedCost = parseFloat(cost)
    if (!cost || isNaN(parsedCost) || parsedCost <= 0) e.cost = 'Informe um preço de custo maior que zero.'
    if (selected?.perecivel === true && !expiry) e.expiry = 'Data de validade obrigatória para produtos perecíveis.'
    if (selected?.perecivel === false && expiry) e.expiry = 'Produto não perecível não deve ter data de validade.'
    return e
  }

  const handleAddToCart = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setCart(prev => [...prev, {
      key: Date.now(),
      productId: selected.id,
      productName: selected.name,
      code: selected.code,
      unit: selected.unit,
      perecivel: selected.perecivel,
      qty: parseFloat(qty),
      cost: parseFloat(cost),
      expiry: expiry || null,
    }])
    setSelected(null)
    setSearch('')
    setQty('')
    setCost('')
    setExpiry('')
  }

  const removeFromCart = (key) => setCart(prev => prev.filter(it => it.key !== key))

  // ── Envio ─────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!cart.length) { toast.warning('Adicione pelo menos um produto à lista antes de registrar.'); return }
    setSubmitting(true)
    try {
      await purchasesApi.createPurchase({
        date: purchaseDate,
        items: cart.map(it => ({
          productId: Number(it.productId),
          quantity: it.qty,
          unitPurchasePrice: it.cost,
          expiringDate: it.expiry || null,
        })),
      })
      toast.success('Entrada de estoque registrada com sucesso!')
      setCart([])
    } catch (e) {
      const msg = e?.response?.data?.message || ''
      if (msg.includes('perecivel') || msg.includes('Expiring')) {
        toast.error('Produto perecível exige data de validade. Verifique os itens.')
      } else if (msg.includes('positive') || msg.includes('Positive')) {
        toast.error('Preço de custo e quantidade devem ser maiores que zero.')
      } else {
        toast.error(msg || 'Erro ao registrar entrada. Verifique os dados e tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Tabela do carrinho ────────────────────────────────────────────────────────

  const columns = [
    { header: 'Produto', key: 'name', render: i => (
      <div>
        <div style={{ fontWeight: 700 }}>{i.productName}</div>
        <div style={{ fontSize: 11, color: '#78716c' }}>{i.code}</div>
      </div>
    )},
    { header: 'Qtd', key: 'qty', style: { textAlign: 'right' },
      render: i => <span>{i.qty} {i.unit}</span> },
    { header: 'Custo Unit.', key: 'cost', style: { textAlign: 'right' },
      render: i => <span>R$ {Number(i.cost).toFixed(2)}</span> },
    { header: 'Data de Validade', key: 'expiry',
      render: i => i.expiry
        ? <span style={{ color: '#b45309', fontWeight: 600 }}>{i.expiry}</span>
        : <span style={{ color: '#a8a29e' }}>Não perecível</span> },
  ]

  const actions = [
    { icon: 'delete', onClick: (it) => removeFromCart(it.key) },
  ]

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='purchases' />
      <MainArea>
        <Topbar searchQuery='' onSearchChange={() => {}} />
        <Content>
          <PageTitle>Entrada de Estoque</PageTitle>
          <PageDesc>Registre compras de produtos para atualizar o estoque disponível.</PageDesc>

          <Grid>
            {/* ── Busca de produto ── */}
            <Card>
              <CardTitle>
                <span className='material-symbols-outlined' style={{ fontSize: 18 }}>search</span>
                1. Selecione o Produto
              </CardTitle>

              {selected ? (
                <SelectedBadge>
                  <div>
                    <div className='name'>{selected.name}</div>
                    <div className='sub'>
                      {selected.code} • {selected.unit}
                      {selected.perecivel && <PerishableTag style={{ marginLeft: 6 }}>Perecível</PerishableTag>}
                    </div>
                  </div>
                  <ClearBtn onClick={() => setSelected(null)} title='Trocar produto'>
                    <span className='material-symbols-outlined'>close</span>
                  </ClearBtn>
                </SelectedBadge>
              ) : (
                <>
                  <Field>
                    <Label>Buscar por nome, código ou marca</Label>
                    <InputBase
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder='Ex: Picanha, ABC123...'
                    />
                  </Field>
                  <SearchResult>
                    {filtered.length === 0 && (
                      <div style={{ padding: 16, color: '#78716c', fontSize: 13, textAlign: 'center' }}>
                        Nenhum produto encontrado.
                      </div>
                    )}
                    {filtered.map(p => (
                      <ProductRow key={p.id}>
                        <div>
                          <div className='name'>{p.name}
                            {p.perecivel && <PerishableTag style={{ marginLeft: 6 }}>Perecível</PerishableTag>}
                          </div>
                          <div className='sub'>{p.code} • {p.brand} • {p.unit}</div>
                        </div>
                        <SelectBtn onClick={() => { setSelected(p); setSearch('') }}>
                          Selecionar
                        </SelectBtn>
                      </ProductRow>
                    ))}
                  </SearchResult>
                </>
              )}
              {errors.product && <ErrorHint>{errors.product}</ErrorHint>}
            </Card>

            {/* ── Dados da entrada ── */}
            <Card>
              <CardTitle>
                <span className='material-symbols-outlined' style={{ fontSize: 18 }}>edit_note</span>
                2. Informe os Dados
              </CardTitle>

              <Field>
                <Label>Data da Compra</Label>
                <InputBase type='date' value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
              </Field>

              <Grid2>
                <Field>
                  <Label>Quantidade *</Label>
                  <InputBase
                    type='number'
                    min='0'
                    step={selected?.unit === 'UN' ? '1' : '0.001'}
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder={selected?.unit === 'UN' ? 'Ex: 10' : 'Ex: 2.500'}
                    $error={!!errors.qty}
                  />
                  {errors.qty && <ErrorHint>{errors.qty}</ErrorHint>}
                </Field>

                <Field>
                  <Label>Preço de Custo (R$) *</Label>
                  <InputBase
                    type='number'
                    min='0.01'
                    step='0.01'
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    placeholder='Ex: 45.90'
                    $error={!!errors.cost}
                  />
                  {errors.cost && <ErrorHint>{errors.cost}</ErrorHint>}
                </Field>
              </Grid2>

              <Field>
                <Label>
                  Data de Validade
                  {selected?.perecivel === true
                    ? <LabelHint>* obrigatório — produto perecível</LabelHint>
                    : selected?.perecivel === false
                      ? <LabelHint>— não preencher para não perecíveis</LabelHint>
                      : <LabelHint>— preencha se o produto tiver validade</LabelHint>
                  }
                </Label>
                <InputBase
                  type='date'
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  disabled={selected?.perecivel === false}
                  $error={!!errors.expiry}
                />
                {errors.expiry && <ErrorHint>{errors.expiry}</ErrorHint>}
              </Field>

              <AddBtn onClick={handleAddToCart} disabled={!selected}>
                <span className='material-symbols-outlined' style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>add_shopping_cart</span>
                Adicionar à Lista
              </AddBtn>
            </Card>
          </Grid>

          {/* ── Lista de itens ── */}
          {cart.length > 0 && (
            <>
              <TableWrapper>
                <DataTable
                  data={cart}
                  columns={columns}
                  actions={actions}
                  currentPage={1}
                  totalPages={1}
                  totalItems={cart.length}
                  onPageChange={() => {}}
                  loading={false}
                  emptyMessage='Nenhum item adicionado.'
                />
              </TableWrapper>

              <SubmitRow>
                <Button variant='secondary' full={false} small onClick={() => setCart([])}>
                  Limpar Lista
                </Button>
                <Button full={false} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Registrar Entrada no Estoque'}
                </Button>
              </SubmitRow>
            </>
          )}

          {cart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#a8a29e', fontSize: 14 }}>
              <span className='material-symbols-outlined' style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>inventory_2</span>
              Selecione produtos e adicione à lista para registrar a entrada.
            </div>
          )}
        </Content>
      </MainArea>
    </Wrapper>
  )
}

export default PurchaseView
