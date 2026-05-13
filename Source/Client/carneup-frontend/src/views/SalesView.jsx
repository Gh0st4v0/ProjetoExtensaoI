import styled, { keyframes } from 'styled-components'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar'
import productsApi from '../services/productsApi'
import { createSale, getSale, searchClients, createClient } from '../services/salesApi'
import { toast } from 'react-toastify'

// ── Animations ─────────────────────────────────────────────────────────────────
const slideIn = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`
const spin = keyframes`to{transform:rotate(360deg)}`

// ── Layout ─────────────────────────────────────────────────────────────────────
const Wrapper = styled.div`
  display:flex; height:100vh; overflow:hidden;
  background:#f1f0ef; font-family:'Work Sans',sans-serif; color:#1c1917;
`
const PdvArea = styled.div`
  flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0;
`

// ── Top bar ────────────────────────────────────────────────────────────────────
const TopBar = styled.div`
  background:#1c1917; padding:10px 20px;
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
`
const TopLeft = styled.div`
  display:flex; align-items:center; gap:12px;
`
const BackBtn = styled.button`
  background:rgba(255,255,255,0.08); border:none; border-radius:8px;
  padding:6px 12px; color:rgba(255,255,255,0.7); cursor:pointer; font-size:13px;
  display:flex; align-items:center; gap:6px;
  &:hover{background:rgba(255,255,255,0.15);}
  span{font-size:16px;}
`
const Title = styled.h1`
  font-family:'Epilogue',sans-serif; font-size:15px; font-weight:900;
  color:#fff; text-transform:uppercase; letter-spacing:0.05em; margin:0;
`
const TopRight = styled.div`
  font-size:11px; color:rgba(255,255,255,0.4); text-align:right;
  p{margin:0;} strong{color:rgba(255,255,255,0.7);}
`

// ── Body ───────────────────────────────────────────────────────────────────────
const Body = styled.div`
  flex:1; display:flex; overflow:hidden; min-height:0;
`

// ── Product Panel ──────────────────────────────────────────────────────────────
const ProductPanel = styled.section`
  flex:1; display:flex; flex-direction:column; min-width:0; background:#fafaf9;
`
const PSearch = styled.div`
  padding:14px 16px; background:#fff; border-bottom:1px solid #e7e5e4; flex-shrink:0;
`
const SearchBox = styled.div`
  display:flex; align-items:center; gap:8px;
  background:#f5f5f4; border-radius:8px; padding:8px 12px;
  border:1px solid transparent;
  &:focus-within{border-color:#610005;background:#fff;}
  input{flex:1;border:none;background:transparent;font-size:14px;font-family:'Work Sans',sans-serif;outline:none;color:#1c1917;&::placeholder{color:#a8a29e;}}
  span{color:#a8a29e;font-size:20px;}
`
const CatTabs = styled.div`
  display:flex; gap:6px; overflow-x:auto; padding:10px 16px; background:#fff;
  border-bottom:1px solid #e7e5e4; flex-shrink:0;
  &::-webkit-scrollbar{display:none;}
`
const CatBtn = styled.button`
  padding:5px 14px; border-radius:999px; white-space:nowrap; cursor:pointer;
  font-size:12px; font-weight:700; font-family:'Epilogue',sans-serif;
  border:1px solid ${p=>p.$a?'#610005':'#e7e5e4'};
  background:${p=>p.$a?'#610005':'#fff'};
  color:${p=>p.$a?'#fff':'#44403c'};
  &:hover{border-color:#610005;color:${p=>p.$a?'#fff':'#610005'};}
`
const PCount = styled.div`
  padding:8px 16px; background:#f5f5f4; border-bottom:1px solid #e7e5e4;
  font-size:11px; font-weight:600; color:#78716c; flex-shrink:0;
`
const PList = styled.div`
  flex:1; overflow-y:auto;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-thumb{background:#e7e5e4;border-radius:4px;}
`
const PRow = styled.div`
  border-bottom:1px solid #f0eeec;
  background:${p=>p.$sel?'#fff8f8':'#fff'};
  cursor:pointer;
  &:hover{background:#fef2f2;}
`
const PRowMain = styled.div`
  display:grid; grid-template-columns:1fr auto auto auto;
  align-items:center; gap:10px; padding:11px 16px;
`
const PName = styled.div`
  min-width:0;
  .name{font-weight:700;font-size:13px;color:#1c1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .sub{font-size:11px;color:#a8a29e;margin-top:1px;}
`
const CBadge = styled.span`
  font-size:9px;font-weight:700;text-transform:uppercase;
  padding:2px 7px;border-radius:999px;background:#ffdad6;color:#610005;white-space:nowrap;
`
const UTag = styled.span`
  font-size:11px;font-weight:700;color:#78716c;background:#f5f5f4;padding:2px 7px;border-radius:5px;
`
const PPrice = styled.span`
  font-family:'Epilogue',sans-serif;font-size:14px;font-weight:900;color:#610005;white-space:nowrap;
`
const InlineAdd = styled.div`
  display:flex; align-items:center; gap:8px; padding:8px 16px 12px;
  background:#fff8f8; border-top:1px dashed #ffdad6;
  animation:${slideIn} 0.15s ease;
`
const ILabel = styled.span`font-size:10px;font-weight:700;color:#78716c;text-transform:uppercase;`
const IInput = styled.input`
  width:88px; padding:7px 10px; border:1px solid #e7e5e4; border-radius:6px;
  font-size:13px; font-family:'Work Sans',sans-serif; text-align:center;
  &:focus{outline:none;border-color:#610005;}
`
const IAdd = styled.button`
  padding:7px 14px; background:#610005; color:#fff; border:none; border-radius:6px;
  font-weight:700; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:4px;
  &:hover{background:#7f1d1d;}
`
const ICancel = styled.button`
  padding:7px 10px; border:1px solid #e7e5e4; background:#fff; border-radius:6px;
  font-size:12px; cursor:pointer; color:#78716c;
  &:hover{background:#f5f5f4;}
`
const EmptyP = styled.div`
  padding:40px 16px; text-align:center; color:#a8a29e; font-size:13px;
  span{display:block;font-size:36px;margin-bottom:8px;}
`

// ── Cart Panel ─────────────────────────────────────────────────────────────────
const CartPanel = styled.aside`
  width:380px; min-width:320px; background:#fff;
  border-left:1px solid #e7e5e4; display:flex; flex-direction:column; flex-shrink:0;
`
const CartHead = styled.div`
  padding:14px 18px; border-bottom:1px solid #f5f5f4;
  display:flex; justify-content:space-between; align-items:center; flex-shrink:0;
  h2{font-family:'Epilogue',sans-serif;font-size:14px;font-weight:900;
     text-transform:uppercase;color:#1c1917;margin:0;}
  span.cnt{font-size:11px;color:#78716c;font-weight:600;}
`
const ClearB = styled.button`
  background:none;border:none;cursor:pointer;color:#d6d3d1;display:flex;align-items:center;
  &:hover{color:#dc2626;}
`
const CartItems = styled.div`
  flex:1; overflow-y:auto; padding:4px 0;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-thumb{background:#e7e5e4;border-radius:4px;}
`
const CItem = styled.div`
  display:flex; align-items:flex-start; gap:10px;
  padding:10px 16px; border-bottom:1px solid #f5f5f4;
  &:hover{background:#fafaf9;}
`
const CIcon = styled.div`
  width:32px; height:32px; border-radius:6px; background:#ffdad6;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  span{color:#610005;font-size:16px;}
`
const CInfo = styled.div`
  flex:1; min-width:0;
  .name{font-weight:700;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .detail{font-size:10px;color:#78716c;margin-top:2px;}
`
const CRight = styled.div`
  display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;
`
const CTotal = styled.span`
  font-family:'Epilogue',sans-serif; font-weight:900; font-size:13px; color:#1c1917;
`
const QCtrl = styled.div`
  display:flex; align-items:center; gap:3px;
  button{width:22px;height:22px;border-radius:4px;border:1px solid #e7e5e4;
    background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    color:#57534e; span{font-size:13px;} &:hover{background:#f5f5f4;}}
`
const QIn = styled.input`
  width:44px;text-align:center;border:1px solid #e7e5e4;border-radius:4px;
  padding:1px 3px;font-size:11px;font-family:'Work Sans',sans-serif;
  &:focus{outline:none;border-color:#610005;}
`
const RmBtn = styled.button`
  background:none;border:none;cursor:pointer;color:#d6d3d1;padding:0;display:flex;align-items:center;
  &:hover{color:#dc2626;} span{font-size:14px;}
`
const EmptyCart = styled.div`
  padding:32px 16px; text-align:center; color:#a8a29e; font-size:13px;
  span{display:block;font-size:36px;margin-bottom:8px;}
`

// ── Cart Footer ────────────────────────────────────────────────────────────────
const CartFooter = styled.div`
  border-top:2px solid #f5f5f4; display:flex; flex-direction:column; gap:0; flex-shrink:0;
`
const Section = styled.div`
  padding:10px 16px; border-bottom:1px solid #f5f5f4;
`
const SLabel = styled.p`
  font-size:9px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.15em; color:#a8a29e; margin:0 0 7px;
`

// Client
const ClientRow = styled.div`display:flex;gap:6px;align-items:center;`
const ClientAnon = styled.button`
  flex:1; padding:8px 10px; border:2px solid ${p=>p.$a?'#610005':'#e7e5e4'};
  background:${p=>p.$a?'#fef2f2':'#fff'}; border-radius:8px; cursor:pointer;
  font-size:11px; font-weight:700; color:${p=>p.$a?'#610005':'#78716c'};
  display:flex; align-items:center; gap:5px; justify-content:center;
  &:hover{border-color:#610005;}
`
const ClientSearch = styled.input`
  flex:2; padding:8px 10px; border:1px solid #e7e5e4; border-radius:8px;
  font-size:12px; font-family:'Work Sans',sans-serif;
  &:focus{outline:none;border-color:#610005;}
`
const ClientDropdown = styled.div`
  margin-top:4px; background:#fff; border:1px solid #e7e5e4; border-radius:8px;
  overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1); max-height:140px; overflow-y:auto;
`
const ClientOpt = styled.div`
  padding:8px 12px; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:8px;
  &:hover{background:#fef2f2;}
  span.ic{color:#610005;font-size:14px;}
`
const ClientBadge = styled.div`
  display:flex; align-items:center; gap:6px; background:#fef2f2;
  border:1px solid #ffdad6; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:700; color:#610005;
  button{background:none;border:none;cursor:pointer;color:#a8a29e;padding:0;display:flex;align-items:center;
    &:hover{color:#dc2626;} span{font-size:14px;}}
`

// Payment
const PayGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:5px;`
const PayBtn = styled.button`
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:7px 4px; border-radius:8px;
  border:2px solid ${p=>p.$a?'#610005':'#e7e5e4'};
  background:${p=>p.$a?'#fef2f2':'#fff'};
  cursor:pointer; transition:all 0.12s;
  &:hover{border-color:#610005;}
  span.icon{font-size:18px;color:${p=>p.$a?'#610005':'#a8a29e'};}
  span.txt{font-size:8px;font-weight:900;text-transform:uppercase;color:${p=>p.$a?'#610005':'#1c1917'};margin-top:1px;letter-spacing:0.05em;}
`

// Advanced / Discount
const AdvTrigger = styled.button`
  display:flex; align-items:center; gap:6px; background:none; border:none;
  font-size:10px; font-weight:600; color:#a8a29e; cursor:pointer; padding:0;
  text-transform:uppercase; letter-spacing:0.1em;
  &:hover{color:#78716c;}
  span{font-size:14px;transition:transform 0.2s;transform:${p=>p.$open?'rotate(180deg)':'none'};}
`
const AdvPanel = styled.div`
  overflow:hidden; transition:max-height 0.25s ease;
  max-height:${p=>p.$open?'120px':'0'};
`
const DiscountRow = styled.label`
  display:flex; align-items:center; gap:10px; cursor:pointer;
  padding:8px 0; font-size:12px; color:#57534e;
  input{accent-color:#610005;width:16px;height:16px;}
`
const DiscTag = styled.span`
  background:#fef3c7; color:#b45309; font-size:10px; font-weight:700;
  padding:2px 7px; border-radius:999px;
`

// Total + Finalize
const TotalBox = styled.div`
  background:#1c1917; border-radius:10px; padding:14px 16px;
  display:flex; justify-content:space-between; align-items:center; margin:10px 16px 0;
  .lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#a8a29e;}
  .val{font-family:'Epilogue',sans-serif;font-size:26px;font-weight:900;color:#fff;line-height:1;}
  .disc{font-size:9px;color:#f87171;margin-top:2px;}
`
const FinalBtn = styled.button`
  margin:10px 16px 14px; padding:14px;
  background:${p=>p.$empty?'#e7e5e4':'#610005'};
  color:${p=>p.$empty?'#a8a29e':'#fff'};
  border:none; border-radius:10px;
  font-family:'Epilogue',sans-serif; font-size:13px; font-weight:900;
  text-transform:uppercase; letter-spacing:0.18em;
  cursor:${p=>p.$empty?'not-allowed':'pointer'};
  display:flex; justify-content:center; align-items:center; gap:8px;
  transition:all 0.15s;
  &:hover:not(:disabled){filter:brightness(1.08);}
`
const Spinner = styled.span`
  display:inline-block; width:16px; height:16px;
  border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
  border-radius:50%; animation:${spin} 0.7s linear infinite;
`

// ── Client Modal ───────────────────────────────────────────────────────────────
const CModal = styled.div`
  background:#fff; border-radius:16px; width:400px; max-width:calc(100% - 32px);
  box-shadow:0 24px 48px rgba(0,0,0,0.2); animation:${slideIn} 0.2s ease;
`
const CModalHead = styled.div`
  padding:20px 22px 16px;
  display:flex; justify-content:space-between; align-items:flex-start;
  border-bottom:1px solid #f5f5f4;
  h2{font-family:'Epilogue',sans-serif;font-size:17px;font-weight:900;color:#1c1917;margin:0;}
  p{font-size:12px;color:#78716c;margin:4px 0 0;}
  button{background:none;border:none;cursor:pointer;color:#a8a29e;display:flex;align-items:center;padding:0;
    &:hover{color:#dc2626;} span{font-size:20px;}}
`
const CModalBody = styled.div`padding:18px 22px;`
const CModalField = styled.div`
  margin-bottom:14px;
  label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;
    letter-spacing:0.12em;color:#78716c;margin-bottom:6px;}
  input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;
    font-size:14px;font-family:'Work Sans',sans-serif;box-sizing:border-box;
    &:focus{outline:none;border-color:#610005;}
  }
  small{display:block;font-size:11px;color:#a8a29e;margin-top:4px;}
`
const CModalActions = styled.div`
  display:flex;gap:8px;padding:0 22px 20px;
`
const CModalCancel = styled.button`
  flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;
  background:#fff;cursor:pointer;font-size:13px;font-family:'Work Sans',sans-serif;color:#78716c;
  &:hover{background:#f5f5f4;}
`
const CModalConfirm = styled.button`
  flex:2;padding:10px;border:none;border-radius:8px;
  background:#610005;color:#fff;cursor:pointer;
  font-family:'Epilogue',sans-serif;font-weight:900;font-size:13px;text-transform:uppercase;
  &:hover{background:#7f1d1d;}
  &:disabled{opacity:0.5;cursor:not-allowed;}
`

// ── Receipt Modal ──────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,0.55);
  display:flex;align-items:center;justify-content:center;z-index:200;
`
const Receipt = styled.div`
  background:#fff; border-radius:16px; width:400px; max-width:calc(100%-32px);
  max-height:90vh; overflow-y:auto; box-shadow:0 24px 48px rgba(0,0,0,0.2);
  animation:${slideIn} 0.2s ease;
`
const RHead = styled.div`
  background:#1c1917; padding:20px 24px; border-radius:16px 16px 0 0; text-align:center;
  h2{font-family:'Epilogue',sans-serif;font-size:20px;font-weight:900;color:#fff;margin:0;}
  p{font-size:11px;color:#78716c;margin:4px 0 0;}
`
const RBody = styled.div`padding:16px 24px;`
const RRow = styled.div`
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 0; border-bottom:1px solid #f5f5f4; font-size:13px;
  &:last-child{border-bottom:none;}
  .item{font-weight:600;color:#1c1917;}
  .qty{color:#78716c;font-size:11px;margin-top:1px;}
  .price{font-weight:700;color:#1c1917;font-family:'Epilogue',sans-serif;}
`
const RDivider = styled.div`height:1px;background:#e7e5e4;margin:8px 0;`
const RTotal = styled.div`
  display:flex; justify-content:space-between; align-items:center; padding:8px 0;
  span.lbl{font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;}
  span.val{font-family:'Epilogue',sans-serif;font-size:22px;font-weight:900;color:#610005;}
`
const RInfo = styled.div`
  background:#f9f9f9; border-radius:8px; padding:10px 12px; margin-top:8px; font-size:12px; color:#57534e;
  display:flex; flex-direction:column; gap:4px;
  span strong{color:#1c1917;}
`
const RActions = styled.div`
  display:flex; gap:8px; padding:16px 24px; border-top:1px solid #f5f5f4;
`
const RBtn = styled.button`
  flex:1; padding:12px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px;
  font-family:'Epilogue',sans-serif; text-transform:uppercase; letter-spacing:0.05em;
  border:${p=>p.$sec?'1px solid #e7e5e4':'none'};
  background:${p=>p.$sec?'#fff':'#610005'};
  color:${p=>p.$sec?'#1c1917':'#fff'};
  &:hover{opacity:0.9;}
`

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const PAYMENTS = [
  { id: 'PIX',      label: 'PIX',      icon: 'qr_code' },
  { id: 'DINHEIRO', label: 'Dinheiro', icon: 'payments' },
  { id: 'CREDITO',  label: 'Crédito',  icon: 'credit_card' },
  { id: 'DEBITO',   label: 'Débito',   icon: 'contactless' },
]
const PAY_LABELS = { PIX:'PIX', DINHEIRO:'Dinheiro', CREDITO:'Crédito', DEBITO:'Débito' }

// ── Component ──────────────────────────────────────────────────────────────────
export const SalesView = ({ navigate }) => {
  // Products
  const [products, setProducts] = useState([])
  const [loadingP, setLoadingP] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('TODOS')
  const [selectedId, setSelectedId] = useState(null)
  const [inlineQty, setInlineQty] = useState('')
  const [inlinePrice, setInlinePrice] = useState('')

  // Cart
  const [cart, setCart] = useState([])

  // Client
  const [anonymous, setAnonymous] = useState(true)
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientDrop, setShowClientDrop] = useState(false)
  const [clientModal, setClientModal] = useState(false)
  const [clientForm, setClientForm] = useState({ nickname: '' })
  const [clientSaving, setClientSaving] = useState(false)

  // Payment & options
  const [payment, setPayment] = useState('DINHEIRO')
  const [advOpen, setAdvOpen] = useState(false)
  const [hasDiscount, setHasDiscount] = useState(false)

  // Sale state
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const searchRef = useRef(null)
  const qtyRef = useRef(null)
  const clientTimer = useRef(null)

  // Load products
  useEffect(() => {
    setLoadingP(true)
    productsApi.getAllProducts(0)
      .then(d => setProducts((d.content || []).map(p => ({
        id: p.id, name: p.name || '', code: p.code || '',
        brand: p.brandName || '', category: p.categoryName || '',
        unit: p.unitMeasurement || 'UN', price: Number(p.precoVenda || 0),
      }))))
      .catch(() => toast.error('Erro ao carregar produtos.'))
      .finally(() => setLoadingP(false))
  }, [])

  // Focus search on mount
  useEffect(() => { searchRef.current?.focus() }, [])
  useEffect(() => { if (selectedId) setTimeout(() => qtyRef.current?.focus(), 50) }, [selectedId])

  // Client search debounce
  useEffect(() => {
    if (anonymous || clientSearch.length < 2) { setClientResults([]); setShowClientDrop(false); return }
    clearTimeout(clientTimer.current)
    clientTimer.current = setTimeout(async () => {
      const res = await searchClients(clientSearch).catch(() => [])
      setClientResults(res)
      setShowClientDrop(true)
    }, 300)
    return () => clearTimeout(clientTimer.current)
  }, [clientSearch, anonymous])

  // Categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
    return ['TODOS', ...cats]
  }, [products])

  // Filtered products
  const displayed = useMemo(() => {
    let list = products
    if (activeCat !== 'TODOS') list = list.filter(p => p.category === activeCat)
    const q = search.trim().toLowerCase()
    if (q.length >= 1) list = list.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    )
    return list
  }, [products, activeCat, search])

  // Select product
  const selectProduct = (p) => {
    if (selectedId === p.id) { setSelectedId(null); return }
    setSelectedId(p.id)
    setInlineQty(p.unit === 'UN' ? '1' : '0.500')
    setInlinePrice(p.price > 0 ? String(p.price) : '')
  }

  // Add to cart
  const addToCart = (p) => {
    const qty = parseFloat(String(inlineQty).replace(',', '.'))
    if (!qty || qty <= 0) { toast.warning('Quantidade inválida.'); return }
    if (p.unit === 'UN' && !Number.isInteger(qty)) { toast.warning('Quantidade inteira para UN.'); return }
    const price = parseFloat(String(inlinePrice).replace(',', '.'))
    if (isNaN(price) || price < 0) { toast.warning('Preço inválido.'); return }
    setCart(prev => [...prev, { key: Date.now(), productId: p.id, name: p.name, unit: p.unit, qty, price }])
    setSelectedId(null); setInlineQty(''); setInlinePrice('')
    searchRef.current?.focus()
  }

  // Cart ops
  const updateQty = (key, val) => {
    const q = parseFloat(String(val).replace(',', '.'))
    if (isNaN(q) || q <= 0) { removeItem(key); return }
    setCart(prev => prev.map(it => it.key === key ? { ...it, qty: q } : it))
  }
  const removeItem = (key) => setCart(prev => prev.filter(it => it.key !== key))
  const clearCart = () => { setCart([]); setSelectedId(null) }

  // Totals
  const subtotal = cart.reduce((s, it) => s + it.qty * it.price, 0)
  const total = hasDiscount ? subtotal * 0.95 : subtotal
  const discount = subtotal - total

  // Client ops
  const handleSelectClient = (c) => {
    setSelectedClient(c); setShowClientDrop(false); setClientSearch('')
  }

  const openClientModal = () => {
    setClientForm({ nickname: clientSearch.trim() })
    setShowClientDrop(false)
    setClientModal(true)
  }

  const handleClientModalSubmit = async (e) => {
    e.preventDefault()
    const nickname = clientForm.nickname.trim()
    if (!nickname) return
    setClientSaving(true)
    try {
      const id = await createClient(nickname)
      setSelectedClient({ id: Number(id), nickname })
      setClientSearch(''); setClientModal(false); setAnonymous(false)
      toast.success(`Cliente "${nickname}" identificado!`)
    } catch { toast.error('Erro ao cadastrar cliente.') }
    finally { setClientSaving(false) }
  }

  // Finalize
  const handleFinalize = async () => {
    if (!cart.length || submitting) return
    const userId = Number(localStorage.getItem('userId'))
    if (!userId) { toast.error('Sessão expirada. Faça login novamente.'); return }
    setSubmitting(true)
    try {
      const payload = {
        userId,
        paymentMethod: payment,
        hasDiscount,
        saleDate: new Date().toISOString().slice(0, 10),
        clienteId: (!anonymous && selectedClient) ? selectedClient.id : null,
        items: cart.map(it => ({ productId: it.productId, quantity: it.qty, precoUnitarioVenda: it.price })),
      }
      const { saleId } = await createSale(payload)
      // Fetch full receipt
      let saleData = null
      if (saleId) saleData = await getSale(saleId).catch(() => null)
      setReceipt({ saleId, saleData, cart: [...cart], total, payment, discount: hasDiscount ? discount : 0, client: !anonymous && selectedClient ? selectedClient : null })
      setCart([]); setHasDiscount(false); setSelectedClient(null); setAnonymous(true)
    } catch (e) {
      const msg = e?.response?.data?.message || ''
      if (msg.includes('insuficiente') || msg.includes('Insufficient')) toast.error('Estoque insuficiente. Faça uma entrada antes de vender.')
      else toast.error(msg || 'Erro ao finalizar venda.')
    } finally { setSubmitting(false) }
  }

  const handleNewSale = () => { setReceipt(null); searchRef.current?.focus() }

  const handlePrint = () => window.print()

  // ── Render ────────────────────────────────────────────────────────────────────
  const userName = localStorage.getItem('userName') || 'Operador'

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='sales' />

      <PdvArea>
        {/* Top Bar */}
        <TopBar>
          <TopLeft>
            <BackBtn onClick={() => navigate('dashboard')}>
              <span className='material-symbols-outlined'>arrow_back</span>Voltar
            </BackBtn>
            <Title>Ponto de Venda</Title>
          </TopLeft>
          <TopRight>
            <p>Operador: <strong>{userName}</strong></p>
            <p>Terminal #01</p>
          </TopRight>
        </TopBar>

        <Body>
          {/* ── PRODUTOS ── */}
          <ProductPanel>
            <PSearch>
              <SearchBox>
                <span className='material-symbols-outlined'>search</span>
                <input ref={searchRef} placeholder='Buscar produto por nome, código ou marca...'
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && <span className='material-symbols-outlined' style={{ cursor:'pointer', fontSize:18 }} onClick={() => setSearch('')}>close</span>}
              </SearchBox>
            </PSearch>

            <CatTabs>
              {categories.map(c => (
                <CatBtn key={c} $a={activeCat === c} onClick={() => setActiveCat(c)}>{c}</CatBtn>
              ))}
            </CatTabs>

            {!loadingP && <PCount>{displayed.length} produto{displayed.length !== 1 ? 's' : ''}</PCount>}

            <PList>
              {loadingP && <EmptyP><span className='material-symbols-outlined'>hourglass_empty</span>Carregando produtos...</EmptyP>}
              {!loadingP && displayed.length === 0 && <EmptyP><span className='material-symbols-outlined'>search_off</span>Nenhum produto encontrado.</EmptyP>}
              {displayed.map(p => (
                <PRow key={p.id} $sel={selectedId === p.id}>
                  <PRowMain onClick={() => selectProduct(p)}>
                    <PName>
                      <div className='name'>{p.name}</div>
                      <div className='sub'>{p.code}{p.brand ? ` · ${p.brand}` : ''}</div>
                    </PName>
                    <CBadge>{p.category || '—'}</CBadge>
                    <UTag>{p.unit}</UTag>
                    <PPrice>{fmt(p.price)}/{p.unit}</PPrice>
                  </PRowMain>

                  {selectedId === p.id && (
                    <InlineAdd onClick={e => e.stopPropagation()}>
                      <ILabel>Qtd</ILabel>
                      <IInput ref={qtyRef} type='number' min='0'
                        step={p.unit === 'UN' ? '1' : '0.001'}
                        value={inlineQty} onChange={e => setInlineQty(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addToCart(p)} />
                      <ILabel>R$</ILabel>
                      <IInput type='number' min='0' step='0.01'
                        value={inlinePrice} onChange={e => setInlinePrice(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addToCart(p)} />
                      <IAdd onClick={() => addToCart(p)}>
                        <span className='material-symbols-outlined' style={{ fontSize:15 }}>add_shopping_cart</span>
                        Adicionar
                      </IAdd>
                      <ICancel onClick={() => setSelectedId(null)}>✕</ICancel>
                    </InlineAdd>
                  )}
                </PRow>
              ))}
            </PList>
          </ProductPanel>

          {/* ── CARRINHO ── */}
          <CartPanel>
            <CartHead>
              <div>
                <h2>Pedido</h2>
                <span className='cnt'>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              </div>
              {cart.length > 0 && <ClearB onClick={clearCart} title='Limpar'><span className='material-symbols-outlined'>delete_sweep</span></ClearB>}
            </CartHead>

            <CartItems>
              {cart.length === 0 && <EmptyCart><span className='material-symbols-outlined'>shopping_cart</span>Clique em um produto para adicionar.</EmptyCart>}
              {cart.map(it => (
                <CItem key={it.key}>
                  <CIcon><span className='material-symbols-outlined'>restaurant</span></CIcon>
                  <CInfo>
                    <div className='name'>{it.name}</div>
                    <div className='detail'>{fmt(it.price)}/{it.unit}</div>
                  </CInfo>
                  <CRight>
                    <CTotal>{fmt(it.qty * it.price)}</CTotal>
                    <QCtrl>
                      <button onClick={() => updateQty(it.key, Math.max(0, it.qty - (it.unit==='UN'?1:0.1)).toFixed(it.unit==='UN'?0:3))}>
                        <span className='material-symbols-outlined'>remove</span>
                      </button>
                      <QIn value={it.qty} type='number' min='0' step={it.unit==='UN'?'1':'0.001'}
                        onChange={e => updateQty(it.key, e.target.value)} />
                      <button onClick={() => updateQty(it.key, it.qty + (it.unit==='UN'?1:0.1))}>
                        <span className='material-symbols-outlined'>add</span>
                      </button>
                      <RmBtn onClick={() => removeItem(it.key)}><span className='material-symbols-outlined'>close</span></RmBtn>
                    </QCtrl>
                  </CRight>
                </CItem>
              ))}
            </CartItems>

            <CartFooter>
              {/* Cliente */}
              <Section>
                <SLabel>Cliente</SLabel>
                {selectedClient && !anonymous ? (
                  <ClientBadge>
                    <span className='material-symbols-outlined' style={{ fontSize:16 }}>person</span>
                    {selectedClient.nickname}
                    <button onClick={() => { setSelectedClient(null); setAnonymous(true) }}>
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </ClientBadge>
                ) : (
                  <>
                    <ClientRow>
                      <ClientAnon $a={anonymous} onClick={() => { setAnonymous(true); setSelectedClient(null); setClientSearch('') }}>
                        <span className='material-symbols-outlined' style={{ fontSize:14 }}>person_off</span>
                        Sem identificação
                      </ClientAnon>
                      <ClientSearch
                        placeholder='Buscar cliente...'
                        value={clientSearch}
                        onFocus={() => setAnonymous(false)}
                        onChange={e => { setAnonymous(false); setClientSearch(e.target.value) }}
                      />
                    </ClientRow>
                    {showClientDrop && (
                      <ClientDropdown>
                        {clientResults.map(c => (
                          <ClientOpt key={c.id} onClick={() => handleSelectClient(c)}>
                            <span className='ic material-symbols-outlined'>person</span>
                            {c.nickname}
                          </ClientOpt>
                        ))}
                        <ClientOpt
                          onClick={openClientModal}
                          style={{ borderTop:'1px solid #f0f0f0', color:'#610005', fontWeight:700 }}
                        >
                          <span className='ic material-symbols-outlined'>person_add</span>
                          {clientSearch.trim().length >= 2
                            ? `Cadastrar "${clientSearch.trim()}"...`
                            : 'Cadastrar novo cliente...'}
                        </ClientOpt>
                      </ClientDropdown>
                    )}
                    {!showClientDrop && !anonymous && clientSearch === '' && (
                      <ClientOpt
                        onClick={openClientModal}
                        style={{ marginTop:4, borderRadius:8, border:'1px dashed #e7e5e4', color:'#610005', fontWeight:700 }}
                      >
                        <span className='ic material-symbols-outlined'>person_add</span>
                        Cadastrar novo cliente
                      </ClientOpt>
                    )}
                  </>
                )}
              </Section>

              {/* Pagamento */}
              <Section>
                <SLabel>Forma de Pagamento</SLabel>
                <PayGrid>
                  {PAYMENTS.map(opt => (
                    <PayBtn key={opt.id} $a={payment === opt.id} onClick={() => setPayment(opt.id)}>
                      <span className={`material-symbols-outlined icon${payment===opt.id?" fill":""}`}
                        style={payment===opt.id?{fontVariationSettings:"'FILL' 1"}:{}}>{opt.icon}</span>
                      <span className='txt'>{opt.label}</span>
                    </PayBtn>
                  ))}
                </PayGrid>
              </Section>

              {/* Opções avançadas (desconto escondido) */}
              <Section>
                <AdvTrigger $open={advOpen} onClick={() => setAdvOpen(o => !o)}>
                  <span className='material-symbols-outlined'>tune</span>
                  Opções
                  <span className='material-symbols-outlined'>expand_more</span>
                </AdvTrigger>
                <AdvPanel $open={advOpen}>
                  <DiscountRow>
                    <input type='checkbox' checked={hasDiscount}
                      onChange={e => setHasDiscount(e.target.checked)} />
                    Aplicar desconto <DiscTag>5% OFF</DiscTag>
                    {hasDiscount && <span style={{ fontSize:11, color:'#b45309' }}>— {fmt(discount)}</span>}
                  </DiscountRow>
                </AdvPanel>
              </Section>

              {/* Total */}
              <TotalBox>
                <div>
                  <p className='lbl'>Total</p>
                  {hasDiscount && <p className='disc'>Com desconto de {fmt(discount)}</p>}
                </div>
                <p className='val'>{fmt(total)}</p>
              </TotalBox>

              <FinalBtn $empty={cart.length === 0} onClick={handleFinalize}
                disabled={cart.length === 0 || submitting}>
                {submitting ? <Spinner /> : <span className='material-symbols-outlined'>check_circle</span>}
                {submitting ? 'Processando...' : 'Finalizar Venda'}
              </FinalBtn>
            </CartFooter>
          </CartPanel>
        </Body>
      </PdvArea>

      {/* ── MODAL CADASTRO CLIENTE ── */}
      {clientModal && (
        <Overlay onClick={() => setClientModal(false)}>
          <CModal onClick={e => e.stopPropagation()}>
            <CModalHead>
              <div>
                <h2>Identificar Cliente</h2>
                <p>Informe o apelido ou nome para identificar o cliente nesta venda.</p>
              </div>
              <button onClick={() => setClientModal(false)}>
                <span className='material-symbols-outlined'>close</span>
              </button>
            </CModalHead>

            <form onSubmit={handleClientModalSubmit}>
              <CModalBody>
                <CModalField>
                  <label>Apelido / Nome *</label>
                  <input
                    autoFocus
                    placeholder='Ex: João da Silva, Mesa 3, Empresa XYZ...'
                    value={clientForm.nickname}
                    onChange={e => setClientForm({ nickname: e.target.value })}
                    required
                  />
                  <small>O apelido é usado para identificar o cliente nos relatórios e histórico de vendas.</small>
                </CModalField>
              </CModalBody>
              <CModalActions>
                <CModalCancel type='button' onClick={() => setClientModal(false)}>Cancelar</CModalCancel>
                <CModalConfirm type='submit' disabled={clientSaving || !clientForm.nickname.trim()}>
                  {clientSaving ? 'Salvando...' : 'Confirmar Identificação'}
                </CModalConfirm>
              </CModalActions>
            </form>
          </CModal>
        </Overlay>
      )}

      {/* ── RECIBO ── */}
      {receipt && (
        <Overlay>
          <Receipt>
            <RHead>
              <h2>🥩 CarneUp</h2>
              <p>Comprovante de Venda {receipt.saleId ? `#${receipt.saleId}` : ''}</p>
              <p>{new Date().toLocaleString('pt-BR')}</p>
            </RHead>

            <RBody>
              {(receipt.saleData?.items || receipt.cart).map((it, i) => (
                <RRow key={i}>
                  <div>
                    <div className='item'>{it.productName || it.name}</div>
                    <div className='qty'>
                      {Number(it.quantity || it.qty).toFixed(3).replace(/\.?0+$/, '')} {it.unit || ''} × {fmt(it.precoUnitarioVenda || it.price)}
                    </div>
                  </div>
                  <span className='price'>{fmt((it.quantity || it.qty) * (it.precoUnitarioVenda || it.price))}</span>
                </RRow>
              ))}

              <RDivider />

              {receipt.discount > 0 && (
                <RRow>
                  <span style={{ color:'#b45309', fontWeight:600 }}>Desconto (5%)</span>
                  <span style={{ color:'#b45309', fontWeight:700 }}>- {fmt(receipt.discount)}</span>
                </RRow>
              )}

              <RTotal>
                <span className='lbl'>Total</span>
                <span className='val'>{fmt(receipt.total)}</span>
              </RTotal>

              <RInfo>
                <span><strong>Pagamento:</strong> {PAY_LABELS[receipt.payment]}</span>
                <span><strong>Cliente:</strong> {receipt.client ? receipt.client.nickname : 'Sem identificação'}</span>
                {receipt.discount > 0 && <span style={{ color:'#b45309' }}><strong>Desconto aplicado:</strong> {fmt(receipt.discount)}</span>}
              </RInfo>
            </RBody>

            <RActions>
              <RBtn $sec onClick={handlePrint}>
                <span className='material-symbols-outlined' style={{ verticalAlign:'middle', marginRight:4, fontSize:16 }}>print</span>
                Imprimir
              </RBtn>
              <RBtn onClick={handleNewSale}>Nova Venda</RBtn>
            </RActions>
          </Receipt>
        </Overlay>
      )}
    </Wrapper>
  )
}
