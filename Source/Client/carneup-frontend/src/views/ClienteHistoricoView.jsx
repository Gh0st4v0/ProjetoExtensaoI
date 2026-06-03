import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { getAllClients, getClientSales } from '../services/salesApi'
import { toast } from 'react-toastify'

// ── Styles ─────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex; min-height: 100vh; background: var(--bg);
  font-family: 'Work Sans', sans-serif;
`
const Main = styled.main`
  flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-x: hidden;
`
const TopBar = styled.div`
  background: var(--sidebar-bg); padding: 14px 28px;
  display: flex; align-items: center; gap: 14px;
`
const BackBtn = styled.button`
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 6px 14px; color: rgba(255,255,255,0.7);
  cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px;
  &:hover { background: rgba(255,255,255,0.15); color: #fff; }
  span { font-size: 16px; }
`
const PageTitle = styled.h1`
  font-family: 'Epilogue', sans-serif; font-size: 16px; font-weight: 900;
  color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;
`
const Content = styled.div`
  padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; flex: 1;
`
const Grid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: 320px 1fr;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`
const Card = styled.div`
  background: #fff; border-radius: 14px; border: 1px solid var(--border);
  overflow: hidden;
`
const CardHead = styled.div`
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  h2 { font-family: 'Epilogue', sans-serif; font-size: 14px; font-weight: 900;
       text-transform: uppercase; letter-spacing: 0.05em; color: var(--text); margin: 0; }
`
const CardBody = styled.div`padding: 20px;`

const Avatar = styled.div`
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--brand); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 22px;
  margin: 0 auto 16px;
`
const ClientName = styled.h3`
  font-family: 'Epilogue', sans-serif; font-size: 18px; font-weight: 900;
  color: var(--text); margin: 0 0 16px; text-align: center;
`
const InfoRow = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
  span.ic { font-size: 16px; color: var(--muted); flex-shrink: 0; }
  div.lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  div.val { font-size: 13px; font-weight: 600; color: var(--text); }
`
const EmptyInfo = styled.span`color: var(--muted); font-size: 12px; font-style: italic;`

const SumRow = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;
`
const SumBox = styled.div`
  background: var(--bg); border-radius: 10px; padding: 12px 14px;
  border-left: 3px solid ${p => p.$c || 'var(--brand)'};
  p.lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin: 0 0 4px; }
  p.val { font-family: 'Epilogue', sans-serif; font-size: 18px; font-weight: 900; color: var(--text); margin: 0; }
`

const SaleCard = styled.div`
  border: 1px solid var(--border); border-radius: 10px;
  overflow: hidden; margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
`
const SaleHead = styled.div`
  padding: 10px 14px; background: var(--bg);
  display: flex; justify-content: space-between; align-items: center;
  .left { display: flex; align-items: center; gap: 10px; }
  .id { font-weight: 700; font-size: 13px; color: var(--text); }
  .date { font-size: 11px; color: var(--muted); }
  .total { font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 16px; color: var(--brand); }
`
const SaleItems = styled.div`padding: 8px 14px 12px;`
const SaleItem = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 0; border-bottom: 1px solid #f9f8f8; font-size: 12px;
  &:last-child { border-bottom: none; }
  .name { color: var(--text); font-weight: 600; }
  .detail { color: var(--muted); margin-top: 1px; font-size: 11px; }
  .price { font-weight: 700; color: var(--text); flex-shrink: 0; }
`
const Badge = styled.span`
  font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 7px;
  border-radius: 999px;
  background: ${p => ({ PIX:'#f0fdf4',DINHEIRO:'#fffbeb',CREDITO:'#eff6ff',DEBITO:'#faf5ff' })[p.$m] || '#f3f4f6'};
  color: ${p => ({ PIX:'#15803d',DINHEIRO:'#b45309',CREDITO:'#1d4ed8',DEBITO:'#7c3aed' })[p.$m] || '#374151'};
`
const Empty = styled.div`
  padding: 40px 20px; text-align: center; color: var(--muted); font-size: 13px;
  span { display: block; font-size: 36px; margin-bottom: 8px; }
`
const Loading = styled.div`padding: 32px; text-align: center; color: var(--muted); font-size: 13px;`

// ── Sort & Pagination styles ───────────────────────────────────────────────────

const SortBar = styled.div`
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
`
const SortLabel = styled.span`
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-right: 2px;
`
const SortBtn = styled.button`
  display: flex; align-items: center; gap: 3px;
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;
  border: 1px solid ${p => p.$active ? 'var(--brand)' : 'var(--border)'};
  background: ${p => p.$active ? '#fff1f0' : '#fff'};
  color: ${p => p.$active ? 'var(--brand)' : 'var(--muted)'};
  transition: all 0.15s;
  &:hover { border-color: var(--brand); color: var(--brand); background: #fff1f0; }
  span { font-size: 13px; }
`
const PagBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border);
  flex-wrap: wrap; gap: 8px;
`
const PagInfo = styled.span`
  font-size: 11px; color: var(--muted);
`
const PagBtns = styled.div`display: flex; gap: 4px; align-items: center;`
const PagBtn = styled.button`
  width: 30px; height: 30px; border-radius: 6px; font-size: 12px; font-weight: 700;
  border: 1px solid ${p => p.$active ? 'var(--brand)' : 'var(--border)'};
  background: ${p => p.$active ? 'var(--brand)' : '#fff'};
  color: ${p => p.$active ? '#fff' : 'var(--text)'};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.4 : 1};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: var(--brand); }
  span { font-size: 14px; }
`

// ── Helpers ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const fmt  = v  => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDT = dt => dt ? new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
const fmtD  = d  => {
  if (!d) return '—'
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }
  const date = new Date(d)
  return isNaN(date) ? '—' : date.toLocaleDateString('pt-BR')
}

const saleTotal = s => Number(s.totalValue || 0) + Number(s.surchargeTotal || 0)

const SORT_OPTIONS = [
  { key: 'date',  label: 'Data',  icon: 'calendar_today' },
  { key: 'value', label: 'Valor', icon: 'attach_money'   },
  { key: 'items', label: 'Itens', icon: 'list'           },
]

function sortSales(sales, key, dir) {
  return [...sales].sort((a, b) => {
    let va, vb
    if (key === 'date') {
      va = a.dataVenda ? new Date(a.dataVenda).getTime() : 0
      vb = b.dataVenda ? new Date(b.dataVenda).getTime() : 0
    } else if (key === 'value') {
      va = saleTotal(a)
      vb = saleTotal(b)
    } else {
      va = (a.items || []).length
      vb = (b.items || []).length
    }
    return dir === 'desc' ? vb - va : va - vb
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export const ClienteHistoricoView = ({ navigate, clientId }) => {
  const [client, setClient]   = useState(null)
  const [sales, setSales]     = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage]       = useState(0)

  useEffect(() => {
    if (!clientId) { navigate('reports'); return }
    setLoading(true)
    Promise.all([
      getAllClients().catch(() => []),
      getClientSales(clientId).catch(() => []),
    ]).then(([clients, clientSales]) => {
      const found = clients.find(c => c.id === clientId)
      setClient(found || null)
      setSales(clientSales?.content ?? (Array.isArray(clientSales) ? clientSales : []))
    }).catch(() => toast.error('Erro ao carregar dados do cliente.'))
    .finally(() => setLoading(false))
  }, [clientId])

  if (loading) return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='reports' />
      <Main><Loading>Carregando histórico do cliente...</Loading></Main>
    </Wrapper>
  )

  if (!client) return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='reports' />
      <Main><Empty><span className='material-symbols-outlined'>person_off</span>Cliente não encontrado.</Empty></Main>
    </Wrapper>
  )

  const totalGasto  = sales.reduce((a, s) => a + saleTotal(s), 0)
  const qtdCompras  = sales.length
  const ticketMedio = qtdCompras > 0 ? totalGasto / qtdCompras : 0
  const initials    = client.nickname?.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

  const sorted     = sortSales(sales, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated  = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  const dirIcon = (key) => {
    if (key !== sortKey) return 'unfold_more'
    return sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'
  }

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='reports' />
      <Main>
        <TopBar>
          <BackBtn onClick={() => navigate('reports')}>
            <span className='material-symbols-outlined'>arrow_back</span>
            Voltar
          </BackBtn>
          <PageTitle>Histórico do Cliente</PageTitle>
        </TopBar>

        <Content>
          <Grid>
            {/* ── Dados do cliente ── */}
            <Card>
              <CardHead><h2>Dados Cadastrais</h2></CardHead>
              <CardBody>
                <Avatar>{initials}</Avatar>
                <ClientName>{client.nickname}</ClientName>

                <InfoRow>
                  <span className='ic material-symbols-outlined'>event</span>
                  <div>
                    <div className='lbl'>Cadastrado em</div>
                    <div className='val'>{fmtDT(client.dataCadastro)}</div>
                  </div>
                </InfoRow>
                <InfoRow>
                  <span className='ic material-symbols-outlined'>phone</span>
                  <div>
                    <div className='lbl'>Telefone</div>
                    <div className='val'>{client.telefone || <EmptyInfo>Não informado</EmptyInfo>}</div>
                  </div>
                </InfoRow>
                <InfoRow>
                  <span className='ic material-symbols-outlined'>cake</span>
                  <div>
                    <div className='lbl'>Aniversário</div>
                    <div className='val'>{fmtD(client.aniversario) || <EmptyInfo>Não informado</EmptyInfo>}</div>
                  </div>
                </InfoRow>
              </CardBody>
            </Card>

            {/* ── Histórico de compras ── */}
            <Card>
              <CardHead>
                <h2>Histórico de Compras</h2>
                {sales.length > 0 && (
                  <SortBar>
                    <SortLabel>Ordenar:</SortLabel>
                    {SORT_OPTIONS.map(opt => (
                      <SortBtn
                        key={opt.key}
                        $active={sortKey === opt.key}
                        onClick={() => handleSort(opt.key)}
                      >
                        <span className='material-symbols-outlined'>{dirIcon(opt.key)}</span>
                        {opt.label}
                      </SortBtn>
                    ))}
                  </SortBar>
                )}
              </CardHead>
              <CardBody>
                <SumRow>
                  <SumBox $c='var(--brand)'>
                    <p className='lbl'>Total Gasto</p>
                    <p className='val'>{fmt(totalGasto)}</p>
                  </SumBox>
                  <SumBox $c='var(--info)'>
                    <p className='lbl'>Compras</p>
                    <p className='val'>{qtdCompras}</p>
                  </SumBox>
                  <SumBox $c='var(--success)'>
                    <p className='lbl'>Ticket Médio</p>
                    <p className='val'>{fmt(ticketMedio)}</p>
                  </SumBox>
                </SumRow>

                {sales.length === 0 ? (
                  <Empty>
                    <span className='material-symbols-outlined'>receipt_long</span>
                    Nenhuma compra registrada para este cliente.
                  </Empty>
                ) : (
                  <>
                    {paginated.map(s => (
                      <SaleCard key={s.id}>
                        <SaleHead>
                          <div className='left'>
                            <span className='id'>Venda #{s.id}</span>
                            {s.payments && s.payments.length > 0 ? (
                              s.payments.map((p, idx) => (
                                <Badge key={idx} $m={p.paymentMethod} style={{ marginRight:6 }}>{p.paymentMethod}</Badge>
                              ))
                            ) : (
                              <Badge $m={s.paymentMethod}>{s.paymentMethod}</Badge>
                            )}
                            {s.hasDiscount && <Badge $m='DESCONTO' style={{ background:'#fffbeb', color:'#b45309' }}>5% OFF</Badge>}
                            {s.surchargeTotal > 0 && <span style={{marginLeft:8,fontSize:12,color:'#1d4ed8'}}>+{fmt(s.surchargeTotal)} (taxa)</span>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className='total'>{fmt(saleTotal(s))}</div>
                            <div className='date'>{fmtD(s.dataVenda)}</div>
                          </div>
                        </SaleHead>
                        <SaleItems>
                          {(s.items || []).map((it, i) => (
                            <SaleItem key={i}>
                              <div>
                                <div className='name'>{it.productName}</div>
                                <div className='detail'>
                                  {Number(it.quantity).toFixed(3).replace(/\.?0+$/, '')} × {fmt(it.precoUnitarioVenda)}
                                </div>
                              </div>
                              <span className='price'>{fmt(Number(it.quantity) * Number(it.precoUnitarioVenda))}</span>
                            </SaleItem>
                          ))}

                          {s.payments && s.payments.length > 0 && (
                            <div style={{marginTop:8}}>
                              {s.payments.map((p, i) => (
                                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:13}}>
                                  <div>{p.paymentMethod}{p.parcelas ? ` • ${p.parcelas}x` : ''}</div>
                                  <div>{fmt(Number(p.valorPago != null ? p.valorPago : p.valor))}{p.acrescimoValor ? ` (+${fmt(p.acrescimoValor)})` : ''}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </SaleItems>
                      </SaleCard>
                    ))}

                    {totalPages > 1 && (
                      <PagBar>
                        <PagInfo>
                          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length} compras
                        </PagInfo>
                        <PagBtns>
                          <PagBtn
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            title='Página anterior'
                          >
                            <span className='material-symbols-outlined'>chevron_left</span>
                          </PagBtn>

                          {Array.from({ length: totalPages }, (_, i) => {
                            if (totalPages <= 7 || Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1) {
                              return (
                                <PagBtn key={i} $active={i === page} onClick={() => setPage(i)}>
                                  {i + 1}
                                </PagBtn>
                              )
                            }
                            if (Math.abs(i - page) === 3) {
                              return <span key={i} style={{ color: 'var(--muted)', fontSize: 12, padding: '0 2px' }}>…</span>
                            }
                            return null
                          })}

                          <PagBtn
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            title='Próxima página'
                          >
                            <span className='material-symbols-outlined'>chevron_right</span>
                          </PagBtn>
                        </PagBtns>
                      </PagBar>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Grid>
        </Content>
      </Main>
    </Wrapper>
  )
}

export default ClienteHistoricoView
