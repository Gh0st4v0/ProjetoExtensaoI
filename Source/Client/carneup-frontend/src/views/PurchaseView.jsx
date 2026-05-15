import React, { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { Button } from '../components/Button'
import { ConfirmModal } from '../components/ConfirmModal'
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
const InputWithSuffix = styled.div`
  display: flex;
  align-items: stretch;
`
const UnitSuffix = styled.span`
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #610005;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 0 8px 8px 0;
  border: 1px solid #610005;
  white-space: nowrap;
`
const PrefixLabel = styled.span`
  display: flex;
  align-items: center;
  padding: 0 10px;
  background: #f5f5f4;
  color: #5a403c;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 8px 0 0 8px;
  white-space: nowrap;
`
const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 2px;
`
const PageBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  &:hover:not(:disabled) { background: #fef2f2; border-color: #610005; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ── Component ─────────────────────────────────────────────────────────────────

const mapProduct = (p) => ({
  id: p.id,
  name: p.name || '',
  code: p.code || '',
  brand: p.brandName || '',
  unit: p.unitMeasurement || 'UN',
  perecivel: p.perecivel,
})

export const PurchaseView = ({ navigate }) => {
  // ── Product search ──
  const [products, setProducts] = useState([])
  const [productPage, setProductPage] = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(0)
  const [productLoading, setProductLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  // ── Form ──
  const [qty, setQty] = useState('')
  const [costDisplay, setCostDisplay] = useState('')
  const [cost, setCost] = useState('')
  const [expiry, setExpiry] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))

  // ── Cart ──
  const [cart, setCart] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ── Guard de saída ──
  const [leaveConfirm, setLeaveConfirm] = useState({ open: false, to: null, params: null })

  const safeNavigate = useCallback((to, params = {}) => {
    if (cart.length > 0) {
      setLeaveConfirm({ open: true, to, params })
    } else {
      navigate(to, params)
    }
  }, [cart.length, navigate])

  // Avisa se fechar/recarregar a aba com itens no carrinho
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (cart.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [cart.length])

  // ── Load products — sempre usa /products/search (q é opcional no backend) ──
  const loadProducts = useCallback(async (query, page) => {
    setProductLoading(true)
    try {
      const data = await productsApi.searchProducts(query?.trim() ?? '', page)
      setProducts((data.content || []).map(mapProduct))
      setProductTotalPages(data.totalPages || 0)
    } catch {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setProductLoading(false)
    }
  }, [])

  const debounceRef = useRef(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setProductPage(0)
      loadProducts(search, 0)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search, loadProducts])

  const handleProductPage = (page) => {
    setProductPage(page)
    loadProducts(search, page)
  }

  // ── BRL currency mask ──
  const handleCostChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits || '0', 10)
    setCostDisplay(cents === 0 ? '' : (cents / 100).toFixed(2).replace('.', ','))
    setCost(cents > 0 ? String(cents / 100) : '')
  }

  // ── Validation ──
  const validate = () => {
    const e = {}
    if (!selected) e.product = 'Selecione um produto.'
    const parsedQty = parseFloat(qty)
    if (!qty || isNaN(parsedQty) || parsedQty <= 0) e.qty = 'Informe uma quantidade maior que zero.'
    if (selected?.unit === 'UN' && !Number.isInteger(parsedQty)) e.qty = 'Produtos UN exigem quantidade inteira.'
    const parsedCost = parseFloat(cost)
    if (!cost || isNaN(parsedCost) || parsedCost <= 0) e.cost = 'Informe um preço de custo maior que zero.'
    if (selected?.perecivel === true) {
      if (!expiry) {
        e.expiry = 'Data de validade obrigatória para produtos perecíveis.'
      } else {
        const today = new Date().toISOString().slice(0, 10)
        if (expiry < today) e.expiry = 'A validade não pode ser uma data passada.'
      }
    }
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
      expiry: selected.perecivel ? expiry : null,
    }])
    setSelected(null)
    setSearch('')
    setQty('')
    setCostDisplay('')
    setCost('')
    setExpiry('')
  }

  const removeFromCart = (key) => setCart(prev => prev.filter(it => it.key !== key))

  // ── Submit ──
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

  // ── Table ──
  const columns = [
    { header: 'Produto', key: 'name', render: i => (
      <div>
        <div style={{ fontWeight: 700 }}>{i.productName}</div>
        <div style={{ fontSize: 11, color: '#78716c' }}>{i.code}</div>
      </div>
    )},
    { header: 'Qtd', key: 'qty', style: { textAlign: 'right' },
      render: i => <span>{i.unit === 'KG' ? `${Number(i.qty).toFixed(3)} kg` : `${i.qty} un`}</span> },
    { header: 'Custo Unit.', key: 'cost', style: { textAlign: 'right' },
      render: i => <span>R$ {Number(i.cost).toFixed(2).replace('.', ',')}</span> },
    { header: 'Validade', key: 'expiry',
      render: i => i.expiry
        ? <span style={{ color: '#b45309', fontWeight: 600 }}>{i.expiry}</span>
        : <span style={{ color: '#a8a29e' }}>—</span> },
  ]

  const actions = [{ icon: 'delete', onClick: (it) => removeFromCart(it.key) }]

  return (
    <Wrapper>
      <Sidebar navigate={safeNavigate} activeView='purchases' />
      <MainArea>
        <Topbar title='Entrada de Estoque' />
        <Content>
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
                  <ClearBtn onClick={() => { setSelected(null); setExpiry('') }} title='Trocar produto'>
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
                    {productLoading && (
                      <div style={{ padding: 16, color: '#78716c', fontSize: 13, textAlign: 'center' }}>Carregando...</div>
                    )}
                    {!productLoading && products.length === 0 && (
                      <div style={{ padding: 16, color: '#78716c', fontSize: 13, textAlign: 'center' }}>
                        Nenhum produto encontrado.
                      </div>
                    )}
                    {!productLoading && products.map(p => (
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
                  {productTotalPages > 1 && (
                    <PaginationRow>
                      <PageBtn disabled={productPage === 0} onClick={() => handleProductPage(productPage - 1)}>
                        <span className='material-symbols-outlined' style={{ fontSize: 16 }}>chevron_left</span>
                      </PageBtn>
                      <span style={{ fontSize: 12, color: '#5a403c' }}>{productPage + 1} / {productTotalPages}</span>
                      <PageBtn disabled={productPage >= productTotalPages - 1} onClick={() => handleProductPage(productPage + 1)}>
                        <span className='material-symbols-outlined' style={{ fontSize: 16 }}>chevron_right</span>
                      </PageBtn>
                    </PaginationRow>
                  )}
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
                  <Label>
                    Quantidade *
                    {selected && <LabelHint>— {selected.unit === 'KG' ? 'kg (3 decimais)' : 'unidades inteiras'}</LabelHint>}
                  </Label>
                  <InputWithSuffix>
                    <InputBase
                      type='number'
                      min='0'
                      step={selected?.unit === 'UN' ? '1' : '0.001'}
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      placeholder={selected?.unit === 'UN' ? '0' : '0.000'}
                      $error={!!errors.qty}
                      style={{ borderRadius: selected ? '8px 0 0 8px' : '8px' }}
                    />
                    {selected && <UnitSuffix>{selected.unit}</UnitSuffix>}
                  </InputWithSuffix>
                  {errors.qty && <ErrorHint>{errors.qty}</ErrorHint>}
                </Field>

                <Field>
                  <Label>Preço de Custo *</Label>
                  <InputWithSuffix>
                    <PrefixLabel>R$</PrefixLabel>
                    <InputBase
                      type='text'
                      inputMode='numeric'
                      value={costDisplay}
                      onChange={handleCostChange}
                      placeholder='0,00'
                      $error={!!errors.cost}
                      style={{ borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
                    />
                  </InputWithSuffix>
                  {errors.cost && <ErrorHint>{errors.cost}</ErrorHint>}
                </Field>
              </Grid2>

              {selected?.perecivel === true && (
                <Field>
                  <Label>
                    Data de Validade
                    <LabelHint>* obrigatório — produto perecível</LabelHint>
                  </Label>
                  <InputBase
                    type='date'
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    $error={!!errors.expiry}
                  />
                  {errors.expiry && <ErrorHint>{errors.expiry}</ErrorHint>}
                </Field>
              )}

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
                <Button variant='secondary' full={false} small onClick={() => setCart([])}>Limpar Lista</Button>
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

      <ConfirmModal
        open={leaveConfirm.open}
        title='Sair sem registrar?'
        message={`Você tem ${leaveConfirm.open ? cart.length : 0} ${cart.length === 1 ? 'produto' : 'produtos'} na lista que ainda não foi registrado no estoque. Se sair agora, a lista será perdida.`}
        confirmLabel='Sair mesmo assim'
        onConfirm={() => {
          const { to, params } = leaveConfirm
          setLeaveConfirm({ open: false, to: null, params: null })
          navigate(to, params)
        }}
        onCancel={() => setLeaveConfirm({ open: false, to: null, params: null })}
      />
    </Wrapper>
  )
}

export default PurchaseView
