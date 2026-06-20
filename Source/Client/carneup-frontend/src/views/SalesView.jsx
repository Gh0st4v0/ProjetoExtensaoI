import styled, { keyframes } from 'styled-components'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar'
import { createSale, getSale, searchClients, createClient, getAllClients } from '../services/salesApi'
import api from '../services/apiClient'
import { toast } from 'react-toastify'
import { loadStoreConfig } from './ConfiguracaoView'
import { toTitleCase, titleCaseHandler } from '../services/textUtils'
import { useAttributes } from '../context/AttributesContext'

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
  flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; background:#fafaf9;
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
  display:flex; gap:6px; overflow-x:auto; padding:10px 16px 8px; background:#fff;
  border-bottom:1px solid #e7e5e4; flex-shrink:0;
  &::-webkit-scrollbar{height:6px;}
  &::-webkit-scrollbar-track{background:#f5f5f4;border-radius:4px;}
  &::-webkit-scrollbar-thumb{background:#c7c3bf;border-radius:4px;}
  &::-webkit-scrollbar-thumb:hover{background:#a8a29e;}
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
  flex:1; overflow-y:auto; padding:4px 0; min-height:80px;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-thumb{background:#e7e5e4;border-radius:4px;}
`
const CItem = styled.div`
  padding:12px 16px; border-bottom:1px solid #f0eeed;
  &:hover{background:#fafaf9;}
`
const CItemRow1 = styled.div`
  display:flex; align-items:flex-start; gap:8px; margin-bottom:8px;
`
const CItemName = styled.div`
  flex:1; font-weight:700; font-size:14px; color:#1c1917;
  line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
`
const CTotal = styled.div`
  font-family:'Epilogue',sans-serif; font-weight:900; font-size:17px;
  color:#610005; white-space:nowrap; flex-shrink:0;
`
const CItemRow2 = styled.div`
  display:flex; align-items:center; justify-content:space-between;
`
const CUnitPrice = styled.div`
  font-size:11px; color:#a8a29e;
`
const QCtrl = styled.div`
  display:flex; align-items:center; gap:4px;
  button{width:28px;height:28px;border-radius:6px;border:1px solid #e7e5e4;
    background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    color:#57534e; span{font-size:16px;} &:hover{background:#f5f5f4;border-color:#d6d3d1;}}
`
const QIn = styled.input`
  width:68px; text-align:center; border:1px solid #e7e5e4; border-radius:6px;
  padding:5px 6px; font-size:13px; font-family:'Work Sans',sans-serif;
  &:focus{outline:none;border-color:#610005;}
`
const RmBtn = styled.button`
  background:none;border:none;cursor:pointer;color:#d6d3d1;padding:2px;
  display:flex;align-items:center;flex-shrink:0;
  &:hover{color:#dc2626;} span{font-size:18px;}
`
const EmptyCart = styled.div`
  padding:32px 16px; text-align:center; color:#a8a29e; font-size:13px;
  span{display:block;font-size:36px;margin-bottom:8px;}
`

// ── Cart Footer ────────────────────────────────────────────────────────────────
const CartFooter = styled.div`
  display:flex; flex-direction:column; gap:0;
  overflow-y:auto; flex-shrink:1; min-height:0;
  border-top:2px solid #f5f5f4;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-thumb{background:#e7e5e4;border-radius:4px;}
`
const CartBottom = styled.div`
  flex-shrink:0; border-top:1px solid #f5f5f4;
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

// ── Payment Modal ──────────────────────────────────────────────────────────────
const PayModal = styled.div`
  background:#fff; border-radius:16px; width:480px; max-width:calc(100% - 32px);
  max-height:90vh; overflow-y:auto; box-shadow:0 24px 48px rgba(0,0,0,0.2);
  animation:${slideIn} 0.2s ease;
`
const PayModalHead = styled.div`
  padding:20px 24px 16px; border-bottom:1px solid #f5f5f4;
  display:flex; justify-content:space-between; align-items:flex-start;
  h2{font-family:'Epilogue',sans-serif;font-size:16px;font-weight:900;color:#1c1917;margin:0;text-transform:uppercase;letter-spacing:0.04em;}
  .total{font-family:'Epilogue',sans-serif;font-size:32px;font-weight:900;color:#610005;margin:4px 0 0;line-height:1;}
  button{background:none;border:none;cursor:pointer;color:#a8a29e;display:flex;align-items:center;padding:0;
    &:hover{color:#dc2626;} span{font-size:22px;}}
`
const PayModalBody = styled.div`
  padding:20px 24px; display:flex; flex-direction:column; gap:16px;
`
const PayModalLabel = styled.p`
  font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em;
  color:#a8a29e; margin:0 0 8px;
`
const PayModalInfo = styled.div`
  background:#f5f5f4; border-radius:8px; padding:10px 14px;
  font-size:12px; color:#57534e; display:flex; align-items:center; gap:8px;
  span{font-size:16px;color:#610005;}
`
const PayModalActions = styled.div`
  display:flex; gap:8px; padding:0 24px 22px;
`
const PayModalCancel = styled.button`
  flex:1; padding:12px; border:1px solid #e5e7eb; border-radius:10px;
  background:#fff; cursor:pointer; font-size:13px; font-family:'Work Sans',sans-serif; color:#78716c;
  &:hover{background:#f5f5f4;}
`
const PayModalConfirm = styled.button`
  flex:2; padding:12px; border:none; border-radius:10px;
  background:#610005; color:#fff; cursor:pointer;
  font-family:'Epilogue',sans-serif; font-weight:900; font-size:13px;
  text-transform:uppercase; letter-spacing:0.08em;
  display:flex; align-items:center; justify-content:center; gap:8px;
  &:hover:not(:disabled){background:#7f1d1d;}
  &:disabled{opacity:0.5;cursor:not-allowed;}
`
const SplitRow = styled.div`
  display:flex; gap:8px; align-items:center;
  select{padding:8px 10px;border:1px solid #e7e5e4;border-radius:8px;font-size:13px;font-family:'Work Sans',sans-serif;background:#fff;}
  input{padding:8px 10px;border:1px solid #e7e5e4;border-radius:8px;font-size:13px;width:110px;font-family:'Work Sans',sans-serif;
    &:focus{outline:none;border-color:#610005;}}
`

// ── Receipt Modal (formato térmico 80mm) ───────────────────────────────────────
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,0.55);
  display:flex;align-items:center;justify-content:center;z-index:200;
`
const ReceiptWrap = styled.div`
  background:#fff; border-radius:12px; width:340px; max-width:calc(100%-32px);
  max-height:92vh; overflow-y:auto; box-shadow:0 24px 48px rgba(0,0,0,0.2);
  animation:${slideIn} 0.2s ease;
  @media print {
    position:fixed; inset:0; width:80mm; max-width:80mm; border-radius:0;
    max-height:none; overflow:visible; box-shadow:none; margin:0;
  }
`
const Thermal = styled.div`
  font-family:'Courier New',Courier,monospace;
  font-size:12px; line-height:1.55; padding:16px 14px; color:#111;
  @media print { padding:4mm 3mm; font-size:11px; }
`
const TCenter = styled.div`text-align:center;`
const TBold = styled.div`font-weight:700; text-align:center; font-size:13px;`
const TDash = styled.div`
  border-top:1px dashed #999; margin:6px 0;
  @media print { border-top:1px dashed #000; }
`
const TRow = styled.div`
  display:flex; justify-content:space-between; align-items:flex-start;
  gap:4px; margin:3px 0;
  .name{flex:1;word-break:break-word;}
  .price{flex-shrink:0;font-weight:700;text-align:right;}
`
const TSubRow = styled.div`color:#555;font-size:11px;margin:-2px 0 4px 2px;`
const TTotalRow = styled.div`
  display:flex; justify-content:space-between; margin:4px 0;
  font-weight:700; font-size:13px;
`
const TFooter = styled.div`text-align:center;margin-top:8px;font-size:11px;color:#555;`
const RActions = styled.div`
  display:flex; gap:8px; padding:12px 14px; border-top:1px solid #eee;
  @media print { display:none; }
`
const RBtn = styled.button`
  flex:1; padding:10px; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px;
  font-family:'Epilogue',sans-serif; text-transform:uppercase; letter-spacing:0.05em;
  border:${p=>p.$sec?'1px solid #e7e5e4':'none'};
  background:${p=>p.$sec?'#fff':'#610005'}; color:${p=>p.$sec?'#1c1917':'#fff'};
  &:hover{opacity:0.9;}
`

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const fmtStock = (qty, unit) => {
  if (unit === 'UN') return `${Math.floor(qty ?? 0)} un`
  const g = Math.round((qty ?? 0) * 1000)
  if (g >= 1000) return `${(g / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })} kg`
  return `${g} g`
}

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
  const [loadingP, setLoadingP] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('TODOS')

  // 👇 ESTAS SÃO AS 3 LINHAS QUE ESTAVAM FALTANDO 👇
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)

  const [selectedId, setSelectedId] = useState(null)
  const [inlineQty, setInlineQty] = useState('')
  const [inlinePrice, setInlinePrice] = useState('')

  const [catalog, setCatalog] = useState([]) 
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false)
  
  // Referência para o controle de tempo do Debounce de produtos
  const productDebounceRef = useRef(null)

  // Price helpers (mask like PurchaseView): format display and accept digits-only input
  const formatPriceDisplay = (value) => {
    if (value == null || value === '') return ''
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
    if (isNaN(num)) return ''
    return num.toFixed(2).replace('.', ',')
  }
  const parseBRL = (v) => {
    if (v == null || v === '') return 0
    const digits = String(v).replace(/\D/g, '')
    const cents = parseInt(digits || '0', 10)
    return cents / 100
  }
  const handleInlinePriceChange = (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '')
    
    if (digits.length > 10) return

    const cents = parseInt(digits || '0', 10)
    setInlinePrice(cents === 0 ? '' : (cents / 100).toFixed(2).replace('.', ','))
  }

  // Força o arredondamento .5 para cima (simula o HALF_UP do Java)
  const roundHalfUp = (num) => {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  }

  // Cart
  const [cart, setCart] = useState([])

  // Client
  const [anonymous, setAnonymous] = useState(true)
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientDrop, setShowClientDrop] = useState(false)
  const [clientModal, setClientModal] = useState(false)
  const [clientForm, setClientForm] = useState({ nickname: '', telefone: '', aniversario: '' })
  const [clientSaving, setClientSaving] = useState(false)

  // Phone formatting helper (view-only formatting; backend receives raw digits)
  const formatPhoneDisplay = (raw) => {
    if (!raw) return ''
    const digits = String(raw).replace(/\D/g,'')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
  }

  const phoneIsValid = (raw) => {
    if (!raw) return true
    const d = String(raw).replace(/\D/g,'')
    return d.length === 10 || d.length === 11
  }

  // Title case handler (preserves cursor)
  const handleNicknameChange = titleCaseHandler((val) => setClientForm(f => ({ ...f, nickname: val })))

  const handlePhoneChange = (e) => {
    const digits = String(e.target.value || '').replace(/\D/g,'')
    setClientForm(f => ({ ...f, telefone: digits }))
  }

  const isClientBirthdayUnder18 = (rawDate) => {
    if (!rawDate) return false
    try {
      const parts = rawDate.split('-')
      if (parts.length < 3) return false
      const y = Number(parts[0]), m = Number(parts[1]) - 1, d = Number(parts[2])
      const b = new Date(y, m, d)
      const today = new Date()
      let age = today.getFullYear() - b.getFullYear()
      const mDiff = today.getMonth() - b.getMonth()
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < b.getDate())) age--
      return age < 18
    } catch { return false }
  }
  // Terms modal for client creation
  const [showTermosModal, setShowTermosModal] = useState(false)
  const [latestTermo, setLatestTermo] = useState(null)
  const [termosLoading, setTermosLoading] = useState(false)
  const [aceitaTermos, setAceitaTermos] = useState(false)
  const [receberPromocoes, setReceberPromocoes] = useState(false)

  // Payment & options
  const [payment, setPayment] = useState('DINHEIRO')
  const [advOpen, setAdvOpen] = useState(false)
  const [hasDiscount, setHasDiscount] = useState(false)
  // Split payments support
  const [splitPayments, setSplitPayments] = useState(false)
  const [paymentsList, setPaymentsList] = useState([])

  // Sale state
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [paymentModal, setPaymentModal] = useState(false)

  const openPaymentModal = () => {
    if (!cart.length) return
    setSplitPayments(false)
    setPaymentsList([])
    setPaymentModal(true)
  }

  const searchRef = useRef(null)
  const qtyRef = useRef(null)
  const clientTimer = useRef(null)

  // Load products — busca TODAS as páginas para exibir catálogo completo no PDV
  // Carrega produtos dinamicamente usando a paginação e busca da API
  // Load products — transferindo a responsabilidade do filtro para o Backend
  // Load products — Agora com suporte a paginação (append)
  const loadProducts = useCallback((query, category, pageNum = 0) => {
    if (pageNum === 0) setLoadingP(true)
    else setLoadingMore(true) // Carregamento silencioso no fim da lista
    
    const hasTextQuery = query && query.trim().length >= 2;
    const hasCategoryQuery = category && category !== 'TODOS';
    
    let searchTerm = '';
    if (hasTextQuery) searchTerm = query.trim();
    else if (hasCategoryQuery) searchTerm = category;

    const apiCall = searchTerm
      ? api.get(`/products/search?q=${encodeURIComponent(searchTerm)}&page=${pageNum}`)
      : api.get(`/products/positive?page=${pageNum}`)

    apiCall
      .then(response => {
        // O Spring Boot devolve as propriedades de paginação no response.data
        const content = response.data.content || response.data || []
        const totalElements = response.data.totalElements || content.length
        const totalPages = response.data.totalPages || 1

        let mapped = content.map(p => ({
          id: p.id, name: p.name || '', code: p.code || '',
          brand: p.brandName || '', category: p.categoryName || '',
          unit: p.unitMeasurement || 'UN', price: Number(p.precoVenda || 0),
          stock: Number(p.stockQuantity ?? 0),
        }))

        if (hasTextQuery && hasCategoryQuery) {
          mapped = mapped.filter(p => p.category === category)
        }

        // Se for página 0, reseta a lista. Se for página > 0, junta com o que já tem
        setProducts(prev => pageNum === 0 ? mapped : [...prev, ...mapped])
        
        // Atualiza os controles de visualização
        setTotalProducts(totalElements)
        setHasMore(pageNum < totalPages - 1)
      })
      .catch(() => toast.error('Erro ao buscar produtos.'))
      .finally(() => {
        setLoadingP(false)
        setLoadingMore(false)
      })
  }, [])

  // ── FUNÇÃO DE SINCRONIZAÇÃO HÍBRIDA ──
  const syncCatalog = useCallback(async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoadingP(true);
      // Se estamos sincronizando de novo (após uma venda), desligamos a memória 
      // temporariamente para o sistema não tentar filtrar dados defasados.
      setIsCatalogLoaded(false); 

      // 1. Busca APENAS a primeira página (Prioridade Máxima)
      const res0 = await api.get('/products/positive?page=0');
      const data0 = res0.data;
      const totalPages = data0.totalPages || 1;
      
      const mapProduct = p => ({
        id: p.id, name: p.name || '', code: p.code || '',
        brand: p.brandName || '', category: p.categoryName || '',
        unit: p.unitMeasurement || 'UN', price: Number(p.precoVenda || 0),
        stock: Number(p.stockQuantity ?? 0),
      });

      let fullCatalog = (data0.content || data0 || []).map(mapProduct);

      // Renderiza a primeira página IMEDIATAMENTE para liberar a tela
      setProducts(fullCatalog);
      setTotalProducts(data0.totalElements || fullCatalog.length);
      if (isFirstLoad) setLoadingP(false); 

      // 2. Busca o restante em background (Sequencialmente para não engasgar a rede)
      if (totalPages > 1) {
        for (let i = 1; i < totalPages; i++) {
          const res = await api.get(`/products/positive?page=${i}`);
          const pageItems = (res.data.content || res.data || []).map(mapProduct);
          fullCatalog = [...fullCatalog, ...pageItems];
          
          // DICA: Se você quiser que a lista de produtos vá "crescendo" 
          // visualmente na frente do usuário enquanto baixa, ative esta linha:
          // setProducts([...fullCatalog]); 
        }
      }

      // 3. Salva o catálogo atualizado e religa o motor de filtro instantâneo
      setCatalog(fullCatalog);
      setIsCatalogLoaded(true);

    } catch (error) {
      console.error('Erro ao sincronizar catálogo:', error);
      if (isFirstLoad) setLoadingP(false);
      toast.error('Erro ao carregar ou atualizar produtos.');
    }
  }, []);

  // Chama no carregamento inicial da tela
  useEffect(() => {
    syncCatalog(true);
  }, [syncCatalog]);

  // ── CARREGAMENTO INICIAL E BACKGROUND FETCH (Página por Página) ──
  useEffect(() => {
    let isMounted = true;

    const loadEverything = async () => {
      try {
        setLoadingP(true);
        
        // 1. Busca apenas a primeira página para mostrar na tela o mais rápido possível
        const res0 = await api.get('/products/positive?page=0');
        const data0 = res0.data;
        const content0 = data0.content || data0 || [];
        const totalPages = data0.totalPages || 1;
        const totalElements = data0.totalElements || content0.length;

        const mapProduct = p => ({
          id: p.id, name: p.name || '', code: p.code || '',
          brand: p.brandName || '', category: p.categoryName || '',
          unit: p.unitMeasurement || 'UN', price: Number(p.precoVenda || 0),
          stock: Number(p.stockQuantity ?? 0),
        });

        const mapped0 = content0.map(mapProduct);

        if (!isMounted) return;

        // Renderiza a página 0 para o tio já ir vendo a tela
        setProducts(mapped0);
        setTotalProducts(totalElements);
        setLoadingP(false);

        let fullCatalog = [...mapped0];

        // 2. Se houverem mais páginas, o Front-end pede todas as outras de uma vez (em background)
        if (totalPages > 1) {
          const requests = [];
          for (let i = 1; i < totalPages; i++) {
            requests.push(api.get(`/products/positive?page=${i}`));
          }

          // Dispara todas as requisições pendentes simultaneamente
          const responses = await Promise.all(requests);
          
          responses.forEach(res => {
             const pageContent = res.data.content || res.data || [];
             fullCatalog = [...fullCatalog, ...pageContent.map(mapProduct)];
          });
        }

        if (!isMounted) return;

        // 3. Salva o catálogo montado no estado e vira a chave da memória RAM!
        setCatalog(fullCatalog);
        setIsCatalogLoaded(true);

      } catch (error) {
        console.error('Erro ao buscar o catálogo paginado:', error);
        if (isMounted) setLoadingP(false);
        toast.error('Erro ao carregar o catálogo de produtos.');
      }
    };

    loadEverything();

    return () => { isMounted = false; };
  }, []);

 // Debounce para escutar a digitação e abas (SOMENTE enquanto o catálogo não baixa)
  useEffect(() => {
    if (isCatalogLoaded) return; // Se já baixou tudo, ignora a API!

    if (productDebounceRef.current) clearTimeout(productDebounceRef.current)
    
    productDebounceRef.current = setTimeout(() => {
      setPage(0) 
      loadProducts(search, activeCat, 0)
    }, 400)

    return () => clearTimeout(productDebounceRef.current)
  }, [search, activeCat, loadProducts, isCatalogLoaded])

  // Desativa o infinite scroll se já temos todos os dados
  const handleScroll = (e) => {
    if (isCatalogLoaded) return; // ⬅️ Adicione esta linha no topo da função

    const { scrollTop, clientHeight, scrollHeight } = e.target
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMore && !loadingP && !loadingMore) {
        const nextPage = page + 1
        setPage(nextPage)
        loadProducts(search, activeCat, nextPage)
      }
    }
  }

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

  // Resgata as categorias cadastradas direto do Contexto global
  const { categories: contextCategories } = useAttributes()

  const categories = useMemo(() => {
    const cats = (contextCategories || []).map(c => c.categoryName).filter(Boolean)
    return ['TODOS', ...cats]
  }, [contextCategories])

  const displayed = useMemo(() => {
    // Se o catálogo em background já baixou, filtramos TUDO no Front-end (Instantâneo)
    if (isCatalogLoaded) {
      return catalog.filter(p => {
        // Filtro de Categoria
        const matchCat = activeCat === 'TODOS' || p.category === activeCat;
        
        // Filtro de Texto (Pesquisa)
        const matchSearch = !search || 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.code.toLowerCase().includes(search.toLowerCase()) || 
          p.brand.toLowerCase().includes(search.toLowerCase());
          
        return matchCat && matchSearch;
      });
    }
    
    // Se ainda está baixando o background, mostra o que veio paginado da API
    return products;
  }, [isCatalogLoaded, catalog, products, activeCat, search])

  // Qty already reserved in cart per product (for display only; validation uses original stock)
  const cartQtyById = useMemo(
    () => cart.reduce((acc, it) => { acc[it.productId] = (acc[it.productId] || 0) + it.qty; return acc }, {}),
    [cart]
  )

  // Select product
  const selectProduct = (p) => {
    if (selectedId === p.id) { setSelectedId(null); return }
    setSelectedId(p.id)
      // Do not prefill quantity; user must type desired amount
      setInlineQty('')
      // Prefill price formatted with two decimals (comma as decimal separator)
      setInlinePrice(formatPriceDisplay(p.price > 0 ? p.price : ''))
    }

  // Add to cart
  // Add to cart
  const addToCart = (p) => {
    const qty = parseFloat(String(inlineQty).replace(',', '.'))
    const minQty = p.unit === 'UN' ? 1 : 0.001
    if (!qty || qty < minQty) {
      toast.warning(p.unit === 'UN' ? 'Quantidade mínima: 1 unidade.' : 'Quantidade mínima: 1 grama (0,001 kg).')
      return
    }
    if (p.unit === 'UN' && !Number.isInteger(qty)) { toast.warning('Quantidade inteira para UN.'); return }
    
    const price = parseFloat(String(inlinePrice).replace(',', '.'))
    if (isNaN(price) || price < 0) { toast.warning('Preço inválido.'); return }
    
    const cartQty = cart.filter(it => it.productId === p.id).reduce((s, it) => s + it.qty, 0)
    if (p.stock != null && !isNaN(p.stock) && qty + cartQty > p.stock + 0.0001) {
      const avail = Math.max(0, p.stock - cartQty)
      toast.warning(`Estoque insuficiente. Disponível: ${fmtStock(avail, p.unit)}`)
      return
    }

    // ── CORREÇÃO AQUI: Verifica se o produto com o MESMO preço já está no carrinho ──
    setCart(prev => {
      const existingItemIndex = prev.findIndex(it => it.productId === p.id && it.price === price)

      if (existingItemIndex > -1) {
        // Se já existe, clona a lista e atualiza apenas a quantidade daquele item
        const newCart = [...prev]
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          qty: newCart[existingItemIndex].qty + qty
        }
        return newCart
      } else {
        // Se não existe, adiciona como um novo item normalmente
        return [...prev, { key: Date.now(), productId: p.id, name: p.name, unit: p.unit, qty, price }]
      }
    })

    setSelectedId(null); setInlineQty(''); setInlinePrice('')
    searchRef.current?.focus()
  }

  // Cart ops
  const updateQty = (key, val) => {
    // 1. Se o campo estiver vazio, permite limpar para o usuário poder redigitar
    if (val === '') {
      setCart(prev => prev.map(it => it.key === key ? { ...it, qty: '' } : it))
      return
    }

    // Normaliza para o padrão de ponto do JavaScript
    const normalizedVal = String(val).replace(',', '.')

    // Busca o item no carrinho atual para checar a unidade de medida (UN)
    const item = cart.find(it => it.key === key)
    if (!item) return

    // 2. REGRA PARA "UN": Bloqueia qualquer ponto/vírgula ou se não for número inteiro
    if (item.unit === 'UN') {
      if (normalizedVal.includes('.') || !/^\d{0,7}$/.test(normalizedVal)) {
        return // Bloqueia a digitação de decimais ou mais de 7 dígitos
      }
    } else {
      // 3. REGRA PARA OUTRAS UNIDADES (KG, etc): Máximo 7 inteiros e estritamente até 3 decimais
      // Esta regex barra a digitação de zeros extras após a 3ª casa (ex: 1.1230)
      if (!/^\d{0,7}(\.\d{0,3})?$/.test(normalizedVal)) {
        return 
      }
    }

    // 4. Se passou nas validações, atualiza o estado mantendo a STRING digitada temporariamente
    // Isso evita que o estado mude para number e o HTML permita os zeros extras à direita
    setCart(prev => prev.map(it => it.key === key ? { ...it, qty: normalizedVal } : it))
  }
  const removeItem = (key) => setCart(prev => prev.filter(it => it.key !== key))
  const clearCart = () => { setCart([]); setSelectedId(null) }

  // Totals
  const rawSubtotal = cart.reduce((s, it) => s + (parseFloat(it.qty) || 0) * it.price, 0);
  const subtotal = roundHalfUp(rawSubtotal);
  const total = roundHalfUp(hasDiscount ? subtotal * 0.95 : subtotal);
  const discount = subtotal - total

  // 👇 1. NOVO: Estado e busca da taxa dinâmica direto da API
  const [creditSurcharge, setCreditSurcharge] = useState(() => loadStoreConfig()?.creditSurcharge ?? 5)

  useEffect(() => {
    api.get('/configuracoes/latest')
      .then(res => {
        if (res.data && res.data.acrescimoCredito != null) {
          setCreditSurcharge(Number(res.data.acrescimoCredito))
        }
      })
      .catch(err => console.error('Erro ao buscar taxa de crédito:', err))
  }, [])

  const creditRate = creditSurcharge / 100;

  const surchargeTotal = (splitPayments && paymentsList && paymentsList.length > 0)
    ? paymentsList.reduce((s, p) => {
        if (p.paymentMethod !== 'CREDITO') return s
        const valorCheio = parseBRL(p.valor)
        const valorBaseOriginal = valorCheio / (1 + creditRate) // Dinâmico
        const taxaDaLinha = roundHalfUp(valorCheio - valorBaseOriginal)
        return s + taxaDaLinha
      }, 0)
    : roundHalfUp(payment === 'CREDITO' ? total * creditRate : 0) // Dinâmico

  // O total a pagar no Modal será o total limpo da venda + a soma das taxas geradas nas linhas
  const totalWithSurcharge = total + surchargeTotal

  // Client ops
  const handleSelectClient = (c) => {
    setSelectedClient(c); setShowClientDrop(false); setClientSearch('')
  }

  const openClientModal = () => {
    setClientForm({ nickname: clientSearch.trim(), aniversario: '' })
    setShowClientDrop(false)
    setClientModal(true)
  }

  const handleClientModalSubmit = async (e) => {
    e.preventDefault()
    const nickname = clientForm.nickname.trim()
    if (!nickname) return
    // fetch latest termo and show terms modal
    setTermosLoading(true)
    try {
      const data = await api.get('/termos/latest').then(r => r.data).catch(() => null)
      setLatestTermo(data)
      setAceitaTermos(false)
      setReceberPromocoes(false)
      setShowTermosModal(true)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar termos. Tente novamente.')
    } finally {
      setTermosLoading(false)
    }
  }

  const handleConfirmTermos = async (e) => {
    e?.preventDefault()
    if (!aceitaTermos) { toast.warning('É necessário aceitar os Termos de Serviço para cadastrar o cliente.'); return }
    if (clientForm.telefone && !phoneIsValid(clientForm.telefone)) { toast.error('Telefone inválido.'); return }
    if (isClientBirthdayUnder18(clientForm.aniversario)) { toast.error('Cliente deve ser maior de 18 anos.'); return }
    setClientSaving(true)
    try {
      const nickname = clientForm.nickname.trim()
      const id = await createClient({
        nickname,
        telefone: clientForm.telefone?.trim() || null,
        aniversario: clientForm.aniversario || null,
        aceitaTermosServico: true,
        receberPromocoes: receberPromocoes ? true : false,
      })

      if (id) {
        setSelectedClient({ id: Number(id), nickname })
        setClientSearch(''); setClientModal(false); setShowTermosModal(false); setAnonymous(false)
        toast.success(`Cliente "${nickname}" identificado!`)
      } else {
        // fallback: try to find the created client by nickname
        const all = await getAllClients().catch(() => [])
        const found = (all || []).find(c => (c.nickname || '').trim() === nickname)
        if (found) {
          setSelectedClient(found)
          setClientSearch(''); setClientModal(false); setShowTermosModal(false); setAnonymous(false)
          toast.success(`Cliente "${nickname}" identificado!`)
        } else {
          setClientModal(false); setShowTermosModal(false); setAnonymous(false)
          toast.warn('Cliente cadastrado, mas não foi possível obter o id automaticamente. Atualize a lista para selecioná-lo.')
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao cadastrar cliente.')
    } finally {
      setClientSaving(false)
    }
  }

  // Finalize
  const handleFinalize = async () => {
    if (!cart.length || submitting) return
    const userId = Number(localStorage.getItem('userId'))
    if (!userId) { toast.error('Sessão expirada. Faça login novamente.'); return }
    
    const creditRate = creditSurcharge / 100;
    
    setSubmitting(true)
    try {
      // Build payments payload com as quatro chaves contratuais do DTO do Spring Boot
      let paymentsPayload = null
      if (splitPayments && paymentsList && paymentsList.length > 0) {
        paymentsPayload = paymentsList.map(p => {
          const valorBrutoInput = parseBRL(p.valor)
          const isCredito = p.paymentMethod === 'CREDITO'
          
          // Se for crédito, deduz a taxa matemática reversa baseada na configuração dinâmica
          const valorLiquido = isCredito ? (valorBrutoInput / (1 + creditRate)) : valorBrutoInput
          const acrescimoValor = isCredito ? (valorBrutoInput - valorLiquido) : 0
          const acrescimoPercent = isCredito ? (creditRate * 100) : 0

          return {
            paymentMethod: p.paymentMethod,
            valor: roundHalfUp(valorLiquido),
            acrescimoPercent: roundHalfUp(acrescimoPercent),
            acrescimoValor: roundHalfUp(acrescimoValor),
            valorPago: roundHalfUp(valorBrutoInput)
          }
        })
      } else {
        // Fluxo de pagamento único direto do PDV
        const isCredito = payment === 'CREDITO'
        const valorLiquido = total
        const acrescimoValor = isCredito ? (total * creditRate) : 0
        const acrescimoPercent = isCredito ? (creditRate * 100) : 0
        const valorBrutoFinal = totalWithSurcharge

        paymentsPayload = [{ 
          paymentMethod: payment, 
          valor: roundHalfUp(valorLiquido),
          acrescimoPercent: roundHalfUp(acrescimoPercent),
          acrescimoValor: roundHalfUp(acrescimoValor),
          valorPago: roundHalfUp(valorBrutoFinal)
        }]
      }

      // Validação baseada na soma dos valores brutos finais contra a meta calculada na tela
      const assigned = paymentsPayload.reduce((s, p) => s + Number(p.valorPago || 0), 0)
      const metaValidacao = totalWithSurcharge

      if (Math.round(assigned * 100) > Math.round(metaValidacao * 100)) {
        toast.error('A soma dos pagamentos excede o total. Ajuste os valores.')
        setSubmitting(false)
        return
      }

      const payload = {
        userId,
        paymentMethod: payment, // mantido para fins de retrocompatibilidade de API antiga
        payments: paymentsPayload,
        hasDiscount,
        clienteId: (!anonymous && selectedClient) ? selectedClient.id : null,
        items: cart.map(it => ({ 
          productId: it.productId, 
          quantity: parseFloat(String(it.qty).replace(',', '.')) || 0, 
          precoUnitarioVenda: it.price 
        })),
      }
      
      const { saleId } = await createSale(payload)
      
      let saleData = null
      if (saleId) saleData = await getSale(saleId).catch(() => null)
      
      setPaymentModal(false)
      setReceipt({ 
        saleId, 
        saleData, 
        cart: [...cart], 
        total: totalWithSurcharge,
        payment, 
        discount: hasDiscount ? discount : 0, 
        client: !anonymous && selectedClient ? selectedClient : null, 
        paymentsSent: paymentsPayload 
      })
      
      setCart([]); setHasDiscount(false); setSelectedClient(null); setAnonymous(true)
    } catch (e) {
      const msg = e?.response?.data?.message || ''
      if (msg.includes('insuficiente') || msg.includes('Insufficient')) {
        toast.error('Estoque insuficiente. Faça uma entrada antes de vender.')
      } else {
        toast.error(msg || 'Erro ao finalizar venda.')
      }
    } finally { setSubmitting(false) }
  }

  const handleNewSale = () => {
    setReceipt(null)
    setCart([])
    setHasDiscount(false)
    setSelectedClient(null)
    setAnonymous(true)
    setPayment('DINHEIRO')
    setSplitPayments(false)
    setPaymentsList([])
    setInlineQty('')
    setInlinePrice('')
    setSearch('')
    searchRef.current?.focus()
    syncCatalog(false)
  }

  const equalSplit = (n) => {
    if (!n || n < 1) return
    
    const creditRate = creditSurcharge / 100;
    
    // Trabalhar com inteiros (centavos) para evitar perda de dizima na divisão base
    const totalCents = Math.round(total * 100)
    const basePorParcelaCents = Math.floor(totalCents / n)
    const restoCents = totalCents % n

    const arr = Array.from({ length: n }).map((_, i) => {
      const method = PAYMENTS[i % PAYMENTS.length].id
      
      // A última parcela absorve os centavos que sobraram do resto da divisão
      let parcelaBaseCents = basePorParcelaCents
      if (i === n - 1) {
        parcelaBaseCents += restoCents
      }

      const parcelaBaseReais = parcelaBaseCents / 100

      // Se for crédito, aplica a taxa sobre a base EXATA daquela parcela
      let valorFinalParcela = parcelaBaseReais
      if (method === 'CREDITO') {
        valorFinalParcela = roundHalfUp(parcelaBaseReais * (1 + creditRate))
      }

      return { 
        id: Date.now() + i, 
        paymentMethod: method, 
        valor: formatPriceDisplay(valorFinalParcela)
      }
    })
    setPaymentsList(arr)
    setSplitPayments(true)
  }

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

            {!loadingP && <PCount>{isCatalogLoaded ? displayed.length : totalProducts} produto{(isCatalogLoaded ? displayed.length : totalProducts) !== 1 ? 's' : ''}</PCount>}

            <PList onScroll={handleScroll}>
              {loadingP && <EmptyP><span className='material-symbols-outlined'>hourglass_empty</span>Carregando produtos...</EmptyP>}
              {!loadingP && displayed.length === 0 && <EmptyP><span className='material-symbols-outlined'>search_off</span>Nenhum produto encontrado.</EmptyP>}
              {displayed.map(p => (
                <PRow key={p.id} $sel={selectedId === p.id}>
                  <PRowMain onClick={() => selectProduct(p)}>
                    <PName>
                      <div className='name'>{p.name}</div>
                      <div className='sub'>
                        {p.code}{p.brand ? ` · ${p.brand}` : ''}
                        {(() => { const avail = Math.max(0, p.stock - (cartQtyById[p.id] || 0)); return (
                          <span style={{ marginLeft:6, color: avail <= 0 ? '#dc2626' : avail < (p.unit==='UN' ? 2 : 0.1) ? '#f59e0b' : '#a8a29e' }}>
                            · {fmtStock(avail, p.unit)}
                          </span>
                        )})()}
                      </div>
                    </PName>
                    <CBadge>{p.category || '—'}</CBadge>
                    <UTag>{p.unit}</UTag>
                    <PPrice>{fmt(p.price)}/{p.unit}</PPrice>
                  </PRowMain>

                  {selectedId === p.id && (
                    <InlineAdd onClick={e => e.stopPropagation()}>
                      <ILabel>Qtd</ILabel>
                      <IInput ref={qtyRef} type='number' min='0'
                        step={p.unit === 'UN' ? '1' : '0.050'}
                        value={inlineQty} 
                        onChange={e => {
                          const val = e.target.value;
                          // Permite campo vazio para o usuário poder apagar tudo
                          if (val === '') {
                            setInlineQty('');
                            return;
                          }
                          // Regex para NUMERIC(10,3): Máximo 7 dígitos inteiros e no máximo 3 decimais
                          if (/^\d{0,7}(\.\d{0,3})?$/.test(val)) {
                            setInlineQty(val);
                          }
                        }}
                        onFocus={e => e.target.select()}
                        onKeyDown={e => e.key === 'Enter' && addToCart(p)} />
                      <ILabel>Preço R$</ILabel>
                      <IInput type='text' inputMode='numeric' placeholder='0,00'
                        value={inlinePrice}
                        onChange={handleInlinePriceChange}
                        onFocus={e => { e.target.select(); }}
                        onBlur={() => setInlinePrice(formatPriceDisplay(inlinePrice))}
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
                  <CItemRow1>
                    <CItemName title={it.name}>{it.name}</CItemName>
                    <CTotal>{fmt(it.qty * it.price)}</CTotal>
                    <RmBtn onClick={() => removeItem(it.key)} title='Remover'>
                      <span className='material-symbols-outlined'>close</span>
                    </RmBtn>
                  </CItemRow1>
                  <CItemRow2>
                    <QCtrl>
                      <button onClick={() => updateQty(it.key, Math.max(0, it.qty - (it.unit==='UN'?1:0.05)).toFixed(it.unit==='UN'?0:3))}>
                        <span className='material-symbols-outlined'>remove</span>
                      </button>
                      <QIn 
                        value={it.qty} 
                        type='number' 
                        min='0' 
                        step={it.unit==='UN'?'1':'0.050'}
                        onChange={e => updateQty(it.key, e.target.value)} 
                      />
                      <button onClick={() => updateQty(it.key, it.qty + (it.unit==='UN'?1:0.05))}>
                        <span className='material-symbols-outlined'>add</span>
                      </button>
                    </QCtrl>
                    <CUnitPrice>{fmt(it.price)}/{it.unit}</CUnitPrice>
                  </CItemRow2>
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

            </CartFooter>

            <CartBottom>
              {/* Total */}
              <TotalBox>
                <div>
                  <p className='lbl'>Total</p>
                  {hasDiscount && <p className='disc'>Com desconto de {fmt(discount)}</p>}
                  {surchargeTotal > 0 && <p style={{fontSize:11,color:'#1d4ed8',margin:0}}>Acréscimos no cartão: {fmt(surchargeTotal)}</p>}
                </div>
                <p className='val'>{fmt(total)}</p>
                {surchargeTotal > 0 && <p style={{fontSize:11,color:'#fff',opacity:0.95,marginTop:6}}>A pagar (com acréscimos): {fmt(totalWithSurcharge)}</p>}
              </TotalBox>

              <FinalBtn $empty={cart.length === 0} onClick={openPaymentModal}
                disabled={cart.length === 0}>
                <span className='material-symbols-outlined'>point_of_sale</span>
                Finalizar Venda
              </FinalBtn>
            </CartBottom>
          </CartPanel>
        </Body>
      </PdvArea>

{/* ── MODAL PAGAMENTO ── */}
      {paymentModal && (
        <Overlay onClick={() => !submitting && setPaymentModal(false)}>
          <PayModal onClick={e => e.stopPropagation()}>
            <PayModalHead>
              <div>
                <h2>Forma de Pagamento</h2>
                {/* CORREÇÃO: Exibe o valor total com os acréscimos das taxas */}
                <p className='total'>{fmt(totalWithSurcharge)}</p>
                {hasDiscount && <p style={{fontSize:12,color:'#b45309',margin:'2px 0 0'}}>Desconto de {fmt(discount)} aplicado</p>}
                {surchargeTotal > 0 && <p style={{fontSize:12,color:'#1d4ed8',margin:'2px 0 0'}}>Acréscimo de cartão incluso: +{fmt(surchargeTotal)}</p>}
              </div>
              <button onClick={() => setPaymentModal(false)} disabled={submitting}>
                <span className='material-symbols-outlined'>close</span>
              </button>
            </PayModalHead>

            <PayModalBody>
              {/* Método único */}
              {!splitPayments && (
                <div>
                  <PayModalLabel>Selecione o método</PayModalLabel>
                  <PayGrid>
                    {PAYMENTS.map(opt => (
                      <PayBtn key={opt.id} $a={payment === opt.id} onClick={() => setPayment(opt.id)}>
                        <span className='material-symbols-outlined icon'
                          style={payment===opt.id?{fontVariationSettings:"'FILL' 1"}:{}}>{opt.icon}</span>
                        <span className='txt'>{opt.label}</span>
                      </PayBtn>
                    ))}
                  </PayGrid>
                  {payment === 'CREDITO' && (
                    <PayModalInfo style={{marginTop:10}}>
                      <span className='material-symbols-outlined'>info</span>
                      Acréscimo de {creditSurcharge.toFixed(1)}% no crédito: +{fmt(total * (creditSurcharge / 100))} → Total: {fmt(total * (1 + (creditSurcharge / 100)))}
                    </PayModalInfo>
                  )}
                </div>
              )}

              {/* Dividir pagamento */}
              <div>
                <PayModalLabel>Divisão</PayModalLabel>
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                  <button type='button'
                    style={{padding:'7px 14px',borderRadius:8,border:'1px solid #e7e5e4',
                      background:splitPayments?'#fef2f2':'#fff',
                      color:splitPayments?'#610005':'#57534e',
                      fontWeight:splitPayments?700:400,fontSize:13,cursor:'pointer'}}
                      onClick={() => {
                        if (!splitPayments) {
                          // Resguarda o método selecionado antes do split
                          const metodoAntesDoSplit = payment;

                          // 1. Reseta o pagamento único padrão para DINHEIRO (limpa taxas globais)
                          setPayment('DINHEIRO');

                          // 2. Calcula o valor inicial usando a taxa dinâmica configurada
                          const creditRate = creditSurcharge / 100;
                          let valorInicial = total;
                          if (metodoAntesDoSplit === 'CREDITO') {
                            valorInicial = total * (1 + creditRate);
                          }

                          setSplitPayments(true);
                          setPaymentsList([{ 
                            id: Date.now(), 
                            paymentMethod: metodoAntesDoSplit, 
                            valor: formatPriceDisplay(Number(valorInicial.toFixed(2))) 
                          }]);
                        } else {
                          setSplitPayments(false);
                          setPaymentsList([]);
                          setPayment('DINHEIRO'); 
                        }
                      }}>
                    {splitPayments ? '✕ Cancelar divisão' : 'Dividir pagamento'}
                  </button>

                  {splitPayments && (
                    <>
                      <span style={{fontSize:12,color:'#a8a29e'}}>Dividir igualmente em</span>
                      {[2, 3, 4].map(n => (
                        <button key={n} type='button'
                          style={{padding:'7px 12px',borderRadius:8,border:'1px solid #e7e5e4',fontSize:13,cursor:'pointer',fontWeight:600}}
                          onClick={() => equalSplit(n)}>{n}x</button>
                      ))}
                    </>
                  )}
                </div>

                {splitPayments && (
                  <PayModalInfo style={{marginTop:10}}>
                    <span className='material-symbols-outlined'>calculate</span>
                    {/* Como a taxa já está no input, a soma do Atribuído é a soma direta dos inputs */}
                    Atribuído (com taxas): <strong>{fmt(paymentsList.reduce((s,p) => s + parseBRL(p.valor), 0))}</strong>
                    &nbsp;— Restante: <strong>{fmt(Math.max(0, totalWithSurcharge - paymentsList.reduce((s,p) => s + parseBRL(p.valor), 0)))}</strong>
                  </PayModalInfo>
                )}
              </div>

              {/* Linhas de split */}
              {splitPayments && (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {paymentsList.map((p) => {
                    const valorInput = parseBRL(p.valor)
                    // Calcula a taxa embutida na linha atual de forma precisa (Valor - (Valor / 1.05))
                    const taxaEmbutidaNaLinha = p.paymentMethod === 'CREDITO' ? (valorInput - (valorInput / (1 + creditRate))) : 0
                    return (
                      <SplitRow key={p.id}>
                        <select value={p.paymentMethod} onChange={e => {
                          const v = e.target.value
                          const creditRate = creditSurcharge / 100;

                          setPaymentsList(prev => prev.map(it => {
                            if (it.id !== p.id) return it
                            let novoValor = parseBRL(it.valor)
                            
                            // Se mudar para crédito, aplica a taxa dinâmica; se tirar, deduz ela (SEMPRE arredondando).
                            if (v === 'CREDITO' && it.paymentMethod !== 'CREDITO') {
                              novoValor = roundHalfUp(novoValor * (1 + creditRate))
                            }
                            if (v !== 'CREDITO' && it.paymentMethod === 'CREDITO') {
                              novoValor = roundHalfUp(novoValor / (1 + creditRate))
                            }
                            
                            return {...it, paymentMethod: v, valor: formatPriceDisplay(novoValor)}
                          }))
                        }}>
                          {PAYMENTS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                        
                        <input type='text' inputMode='numeric' placeholder='0,00' value={p.valor}
                          onChange={e => {
                            const digits = String(e.target.value || '').replace(/\D/g, '')
                            let cents = parseInt(digits || '0', 10)
                            
                            // Soma quanto as OUTRAS linhas já cobriram do totalWithSurcharge
                            const otherLinesTotal = paymentsList.reduce((s, it) => {
                              if (it.id === p.id) return s
                              return s + Math.round(parseBRL(it.valor) * 100)
                            }, 0)

                            const maxAllowedCents = Math.round(totalWithSurcharge * 100)
                            
                            if (otherLinesTotal + cents > maxAllowedCents) {
                              cents = Math.max(0, maxAllowedCents - otherLinesTotal)
                              toast.error('Valor ajustado para o restante disponível.')
                            }

                            const str = cents === 0 ? '' : (cents / 100).toFixed(2).replace('.', ',')
                            setPaymentsList(prev => prev.map(it => it.id === p.id ? {...it, valor: str} : it))
                          }}
                        />
                        
                        {/* CORREÇÃO VISUAL: Se o input for 105,00, vai exibir exatamente "(Incluso +R$ 5,00)" */}
                        {p.paymentMethod === 'CREDITO' && valorInput > 0 && (
                          <span style={{fontSize:11,color:'#1d4ed8',whiteSpace:'nowrap', fontWeight:'bold'}}>
                            (Incluso +{fmt(taxaEmbutidaNaLinha)})
                          </span>
                        )}
                        
                        <button type='button'
                          onClick={() => setPaymentsList(prev => prev.filter(it => it.id !== p.id))}
                          style={{border:'none',background:'none',color:'#dc2626',cursor:'pointer',fontSize:12,whiteSpace:'nowrap'}}>
                          Remover
                        </button>
                      </SplitRow>
                    )
                  })}
                  
                  <button type='button' onClick={() => {
                    const assigned = paymentsList.reduce((s,p) => s + parseBRL(p.valor), 0)
                    const remaining = Math.max(0, totalWithSurcharge - assigned)
                    if (remaining <= 0) { toast.error('Total já coberto.'); return }
                    
                    setPaymentsList(prev => [...prev, { id: Date.now()+Math.random(), paymentMethod: 'DINHEIRO', valor: formatPriceDisplay(remaining) }])
                  }} style={{padding:'7px 14px',borderRadius:8,border:'1px dashed #e7e5e4',fontSize:13,cursor:'pointer',color:'#610005',fontWeight:600,background:'#fff8f8'}}>
                    + Adicionar forma
                  </button>
                </div>
              )}
            </PayModalBody>

            <PayModalActions>
              <PayModalCancel onClick={() => setPaymentModal(false)} disabled={submitting}>
                Cancelar
              </PayModalCancel>
              <PayModalConfirm onClick={handleFinalize} disabled={submitting}>
                {submitting ? <Spinner /> : <span className='material-symbols-outlined'>check_circle</span>}
                {submitting ? 'Processando...' : 'Confirmar Venda'}
              </PayModalConfirm>
            </PayModalActions>
          </PayModal>
        </Overlay>
      )}

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
                    placeholder='Ex: João da Silva, Mesa 3...'
                    value={clientForm.nickname}
                    onChange={handleNicknameChange}
                    required
                  />
                  <small>Obrigatório — usado para identificar o cliente nos relatórios.</small>
                </CModalField>
                <CModalField>
                  <label>Telefone</label>
                  <input
                    placeholder='Ex: (11) 99999-9999'
                    value={formatPhoneDisplay(clientForm.telefone)}
                    onChange={handlePhoneChange}
                  />
                  {clientForm.telefone && !phoneIsValid(clientForm.telefone) && <small style={{color:'#dc2626'}}>Telefone inválido — use (XX) 99999-9999</small>}
                </CModalField>
                <CModalField>
                  <label>Aniversário</label>
                  <input
                    type='date'
                    value={clientForm.aniversario || ''}
                    onChange={e => setClientForm(f => ({ ...f, aniversario: e.target.value }))}
                  />
                  {clientForm.aniversario && isClientBirthdayUnder18(clientForm.aniversario) && <small style={{color:'#dc2626'}}>Cliente deve ser maior de 18 anos</small>}
                  <small>Todos os campos acima são opcionais, exceto o apelido.</small>
                </CModalField>
              </CModalBody>
              <CModalActions>
                <CModalCancel type='button' onClick={() => setClientModal(false)}>Cancelar</CModalCancel>
                <CModalConfirm type='submit' disabled={clientSaving || !clientForm.nickname.trim() || (clientForm.telefone && !phoneIsValid(clientForm.telefone)) || isClientBirthdayUnder18(clientForm.aniversario)}>
                  {clientSaving ? 'Salvando...' : 'Confirmar Identificação'}
                </CModalConfirm>
              </CModalActions>
            </form>
          </CModal>
        </Overlay>
      )}

      {showTermosModal && (
        <Overlay onClick={() => setShowTermosModal(false)}>
          <CModal onClick={e => e.stopPropagation()}>
            <CModalHead>
              <div>
                <h2>Termos e Condições</h2>
                <p style={{margin:0,fontSize:12,color:'#78716c'}}>Revise e aceite os Termos de Serviço para prosseguir com o cadastro do cliente.</p>
              </div>
              <button onClick={() => setShowTermosModal(false)}>
                <span className='material-symbols-outlined'>close</span>
              </button>
            </CModalHead>

            <form onSubmit={handleConfirmTermos}>
              <CModalBody>
                <div style={{maxHeight:220, overflowY:'auto', padding:12, border:'1px solid #f0f0f0', borderRadius:8, whiteSpace:'pre-wrap', fontSize:13, color:'#333'}}>
                  {termosLoading ? 'Carregando termo...' : (latestTermo?.conteudo || 'Nenhum termo cadastrado.')}
                </div>

                <div style={{marginTop:12}}>
                  <label style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type='checkbox' checked={aceitaTermos} onChange={e => setAceitaTermos(e.target.checked)} />
                    Estou de acordo com os Termos de Serviço (obrigatório)
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                    <input type='checkbox' checked={receberPromocoes} onChange={e => setReceberPromocoes(e.target.checked)} />
                    Desejo receber promoções e marketing (opcional)
                  </label>
                </div>

              </CModalBody>

              <CModalActions>
                <CModalCancel type='button' onClick={() => setShowTermosModal(false)}>Cancelar</CModalCancel>
                <CModalConfirm type='submit' disabled={!aceitaTermos || clientSaving || (clientForm.telefone && !phoneIsValid(clientForm.telefone)) || isClientBirthdayUnder18(clientForm.aniversario)}>
                  {clientSaving ? 'Salvando...' : 'Aceitar e Salvar'}
                </CModalConfirm>
              </CModalActions>
            </form>
          </CModal>
        </Overlay>
      )}

      {/* ── RECIBO TÉRMICO 80mm ── */}
      {receipt && (() => {
        const cfg = loadStoreConfig()
        const saleData = receipt.saleData || null
        const items = saleData?.items || receipt.cart
        const subtotal = items.reduce((a,it) => a + (it.quantity||it.qty)*(it.precoUnitarioVenda||it.price), 0)
        const surchargeFromPayments = saleData?.payments ? saleData.payments.reduce((s,p) => s + Number(p.acrescimoValor || 0), 0) : 0
        const now = new Date().toLocaleString('pt-BR')
        const baseTotal = saleData?.totalValue != null ? Number(saleData.totalValue) : Number(receipt.total || 0)
        const totalWithSurcharge = baseTotal + surchargeFromPayments
        return (
        <Overlay>
          <ReceiptWrap>
            <Thermal>
              <TBold>{cfg.storeName.toUpperCase()}</TBold>
              {cfg.address && <TCenter>{cfg.address}</TCenter>}
              {cfg.city    && <TCenter>{cfg.city}</TCenter>}
              {cfg.phone   && <TCenter>Tel: {cfg.phone}</TCenter>}
              <TDash />
              {cfg.instagram && <TCenter>Instagram: {cfg.instagram}</TCenter>}
              <TCenter>{now}</TCenter>
              {receipt.saleId && <TCenter>Venda #{receipt.saleId}</TCenter>}
              <TDash />

              {items.map((it, i) => {
                const qty   = Number(it.quantity || it.qty)
                const price = Number(it.precoUnitarioVenda || it.price)
                const total = qty * price
                const name  = (it.productName || it.name || '').toUpperCase()
                return (
                  <div key={i}>
                    <TRow>
                      <span className='name'>{name}</span>
                      <span className='price'>{fmt(total)}</span>
                    </TRow>
                    <TSubRow>
                      {qty.toFixed(qty % 1 === 0 ? 0 : 3)} x {fmt(price)}
                    </TSubRow>
                  </div>
                )
              })}

              <TDash />
              {receipt.discount > 0 && (
                <TRow><span>DESCONTO (5%)</span><span>-{fmt(receipt.discount)}</span></TRow>
              )}
              <TTotalRow>
                <span>TOTAL</span>
                <span>{fmt(totalWithSurcharge)}</span>
              </TTotalRow>

              {/* Payments breakdown (prefer server-provided payments) */}
              {/* Payments breakdown (agrupando métodos repetidos) */}
              {(() => {
                // 1. Identifica qual fonte de dados de pagamento está disponível e normaliza a estrutura
                const rawPayments = saleData?.payments && saleData.payments.length > 0
                  ? saleData.payments.map(p => ({
                      method: p.paymentMethod,
                      valor: Number(p.valorPago != null ? p.valorPago : p.valor),
                      taxa: Number(p.acrescimoValor || 0)
                    }))
                  : receipt.paymentsSent && receipt.paymentsSent.length > 0
                  ? receipt.paymentsSent.map(p => ({
                      method: p.paymentMethod,
                      valor: Number(p.valor != null ? p.valor : p.valorPago || 0),
                      taxa: p.paymentMethod === 'CREDITO' ? Number(p.valor != null ? p.valor : p.valorPago || 0) * (creditSurcharge / 100) : 0                    }))
                  : null;

                // 2. Se for o fluxo de pagamento único direto do PDV (sem split)
                if (!rawPayments) {
                  return (
                    <TRow>
                      <span>{PAY_LABELS[receipt.payment] || receipt.payment}</span>
                      <span>{fmt(totalWithSurcharge)}</span>
                    </TRow>
                  );
                }

                // 3. Agrupa os pagamentos repetidos somando os valores acumulados e as respectivas taxas
                const groupedPayments = rawPayments.reduce((acc, current) => {
                  const existing = acc.find(p => p.method === current.method);
                  if (existing) {
                    existing.valor += current.valor;
                    existing.taxa += current.taxa;
                  } else {
                    acc.push({ ...current });
                  }
                  return acc;
                }, []);

                // 4. Renderiza as linhas consolidadas sem duplicação no cupom de 80mm
                return groupedPayments.map((p, i) => (
                  <div key={i}>
                    <TRow>
                      <span>{PAY_LABELS[p.method] || p.method}</span>
                      <span>{fmt(p.valor)}</span>
                    </TRow>
                    {p.taxa > 0 && (
                      <TSubRow>Taxa financeira consolidada: +{fmt(p.taxa)}</TSubRow>
                    )}
                  </div>
                ));
              })()}

              {receipt.client && <TRow><span>CLIENTE</span><span>{receipt.client.nickname}</span></TRow>}
              <TDash />
              <TFooter>{cfg.footerMsg}</TFooter>
            </Thermal>

            <RActions>
              <RBtn $sec onClick={handlePrint}>
                <span className='material-symbols-outlined' style={{ verticalAlign:'middle', marginRight:4, fontSize:16 }}>print</span>
                Imprimir
              </RBtn>
              <RBtn onClick={handleNewSale}>Nova Venda</RBtn>
            </RActions>
          </ReceiptWrap>
        </Overlay>
        )
      })()}
    </Wrapper>
  )
}
