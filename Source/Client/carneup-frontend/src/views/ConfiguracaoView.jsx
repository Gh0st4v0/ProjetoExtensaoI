import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { toast } from 'react-toastify'
import api from '../services/apiClient'
import ConfirmModal from '../components/ConfirmModal'

// ── Styles ────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Work Sans', sans-serif;
`

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`

const TopBar = styled.div`
  background: var(--sidebar-bg);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  gap: 12px;

  span.icon { color: rgba(255,255,255,0.4); font-size: 20px; }
  h1 {
    font-family: 'Epilogue', sans-serif;
    font-size: 16px;
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
`

const TabBar = styled.div`
  background: #fff;
  border-bottom: 1px solid var(--border);
  display: flex;
  padding: 0 28px;
  gap: 0;
`

const Tab = styled.button`
  padding: 14px 18px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: 'Work Sans', sans-serif;
  font-size: 13px;
  font-weight: ${p => p.$active ? '700' : '500'};
  color: ${p => p.$active ? 'var(--brand)' : 'var(--muted)'};
  border-bottom: 2px solid ${p => p.$active ? 'var(--brand)' : 'transparent'};
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;

  span { font-size: 17px; }
  &:hover { color: ${p => p.$active ? 'var(--brand)' : 'var(--text)'}; }
`

const Content = styled.div`
  padding: 28px;
  max-width: 800px;
  width: 100%;
`

const Card = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
`

const CardHead = styled.div`
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;

  span.icon { color: var(--brand); font-size: 20px; }
  h2 {
    font-family: 'Epilogue', sans-serif;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text);
    margin: 0;
  }
  p {
    margin: 0 0 0 auto;
    font-size: 11px;
    color: var(--muted);
  }
`

const CardBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: ${p => p.$cols || '1fr'};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.label`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  font-family: 'Work Sans', sans-serif;
  color: var(--text);
  background: #fff;

  &:focus {
    outline: none;
    border-color: var(--brand);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 260px;
  padding: 12px;
  font-size: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-family: 'Work Sans', sans-serif;
  resize: vertical;
  color: var(--text);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--brand);
  }
`

const SaveBtn = styled.button`
  padding: 11px 24px;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  align-self: flex-start;

  &:hover:not(:disabled) { background: var(--brand-hover); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  padding: 10px 14px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);

  span { font-size: 16px; color: var(--brand); flex-shrink: 0; }
`

const Preview = styled.div`
  background: #1c1917;
  color: #fff;
  border-radius: 10px;
  padding: 24px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre;
`

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'carneup_store_config'

const DEFAULT_CONFIG = {
  storeName:         'Açougue Bom Pedaço',
  cnpj:              '12.345.678/0001-90',
  address:           'Rua das Carnes, 42 - Centro',
  city:              'São Paulo - SP',
  phone:             '(11) 3456-7890',
  instagram:         '',
  footerMsg:         'Obrigado pela preferência!',
  expiryDays:        7,
  clienteInativoDias: 30,
  creditSurcharge:   5
}

const TABS = [
  { id: 'loja',       label: 'Dados da Loja',  icon: 'storefront'       },
  { id: 'financeiro', label: 'Financeiro',      icon: 'account_balance'  },
  { id: 'nota',       label: 'Prévia da Nota',  icon: 'receipt_long'     },
  { id: 'termos',     label: 'Termos',          icon: 'description'      },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export const loadStoreConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG }
  } catch { return { ...DEFAULT_CONFIG } }
}

const onlyDigits = s => (s || '').replace(/\D/g, '')

const formatCNPJ = (value) => {
  const d = onlyDigits(value).slice(0, 14)
  if (!d) return ''
  if (d.length <= 2) return d
  if (d.length <= 5) return d.replace(/^(\d{2})(\d+)/, '$1.$2')
  if (d.length <= 8) return d.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
  if (d.length <= 12) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4')
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
}

const formatPhone = (value) => {
  const d = onlyDigits(value).slice(0, 11)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const center = (str, width = 32) => {
  str = str || ''
  const pad = Math.max(0, width - str.length)
  return ' '.repeat(Math.floor(pad / 2)) + str + ' '.repeat(Math.ceil(pad / 2))
}

const col = (label, value, width = 32) => {
  const valStr = String(value || '')
  const avail = width - label.length - 1
  const val = valStr.length > avail ? valStr.slice(0, avail) : valStr.padStart(avail)
  return `${label} ${val}`
}

const buildPreview = (form) => [
  center(String(form.storeName || '').toUpperCase()),
  form.cnpj      ? `CNPJ: ${form.cnpj}`             : '',
  form.address   || '',
  form.city      || '',
  form.phone     ? `Tel: ${form.phone}`              : '',
  form.instagram ? `Instagram: ${form.instagram}`    : '',
  '--------------------------------',
  `DATA: ${new Date().toLocaleString('pt-BR')}`,
  '--------------------------------',
  col('PICANHA 1.200KG',  'R$ 82,80'),
  col('COSTELA  0.800KG', 'R$ 38,40'),
  '- - - - - - - - - - - - - - - -',
  col('SUBTOTAL',  'R$ 121,20'),
  col('TOTAL',     'R$ 121,20'),
  col('PAGAMENTO', 'PIX'),
  '--------------------------------',
  center(form.footerMsg),
].filter(Boolean).join('\n')

// ── Component ─────────────────────────────────────────────────────────────────

export const ConfiguracaoView = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('loja')

  // ── Store config (localStorage) ───────────────────────────────────────────
  const [form, setForm] = useState(loadStoreConfig)
  const [storeSaved, setStoreSaved] = useState(false)

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSaveStore = (e) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setStoreSaved(true)
    toast.success('Configurações da loja salvas!')
    setTimeout(() => setStoreSaved(false), 3000)
  }

  // ── Finance config (API) ──────────────────────────────────────────────────
  const [financeConfig, setFinanceConfig] = useState({
    lucroEsperado: '20.00',
    taxaDebito:    '2.50',
    taxaCredito:   '3.50',
    acrescimoCredito: '5.00'
  })
  const [financeLoading,    setFinanceLoading]    = useState(false)
  const [savingFinance,     setSavingFinance]      = useState(false)
  const [financeCreatedAt,  setFinanceCreatedAt]   = useState(null)
  const [financeConfirmOpen, setFinanceConfirmOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    setFinanceLoading(true)
    api.get('/configuracoes/latest')
      .then(r => {
        if (!mounted) return
        const d = r.data
        if (d) {
          setFinanceConfig({
            lucroEsperado:    d.lucroEsperado    != null ? String(d.lucroEsperado) : '',
            taxaDebito:       d.taxaDebito       != null ? String(d.taxaDebito)    : '',
            taxaCredito:      d.taxaCredito      != null ? String(d.taxaCredito)   : '',
            acrescimoCredito: d.acrescimoCredito != null ? String(d.acrescimoCredito) : '5.00',
          })
          setFinanceCreatedAt(d.createdAt || d.criadoEm || d.created_at || null)
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setFinanceLoading(false) })
    return () => { mounted = false }
  }, [])

  const saveFinance = async () => {
    setSavingFinance(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    try {
      await api.post('/configuracoes', {
        lucroEsperado: financeConfig.lucroEsperado === '' ? null : Number(financeConfig.lucroEsperado),
        taxaDebito:    financeConfig.taxaDebito    === '' ? null : Number(financeConfig.taxaDebito),
        taxaCredito:   financeConfig.taxaCredito   === '' ? null : Number(financeConfig.taxaCredito),
        acrescimoCredito: financeConfig.acrescimoCredito === '' ? null : Number(financeConfig.acrescimoCredito),
      })
      const latest = await api.get('/configuracoes/latest').then(r => r.data).catch(() => null)
      if (latest) {
        setFinanceConfig({
          lucroEsperado: latest.lucroEsperado != null ? String(latest.lucroEsperado) : '',
          taxaDebito:    latest.taxaDebito    != null ? String(latest.taxaDebito)    : '',
          taxaCredito:   latest.taxaCredito   != null ? String(latest.taxaCredito)   : '',
        })
        setFinanceCreatedAt(latest.createdAt || latest.criado_em || latest.criadoEm || null)
      }
      toast.success('Parâmetros financeiros salvos!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar configurações financeiras')
    } finally {
      setSavingFinance(false)
    }
  }

  // ── Terms (API) ───────────────────────────────────────────────────────────
  const [termoConteudo,    setTermoConteudo]    = useState('')
  const [termoId,          setTermoId]          = useState(null)
  const [termoCriadoEm,    setTermoCriadoEm]    = useState(null)
  const [termoLoading,     setTermoLoading]     = useState(false)
  const [savingTermo,      setSavingTermo]      = useState(false)
  const [termoConfirmOpen, setTermoConfirmOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    setTermoLoading(true)
    api.get('/termos/latest')
      .then(r => {
        if (!mounted) return
        const data = r.data
        if (data) {
          setTermoConteudo(data.conteudo || '')
          setTermoId(data.id || null)
          setTermoCriadoEm(data.criadoEm || data.criado_em || null)
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setTermoLoading(false) })
    return () => { mounted = false }
  }, [])

  const saveTermo = async () => {
    setSavingTermo(true)
    try {
      await api.post('/termos', { conteudo: termoConteudo })
      const latest = await api.get('/termos/latest').then(r => r.data).catch(() => null)
      if (latest) {
        setTermoId(latest.id || null)
        setTermoCriadoEm(latest.criadoEm || latest.criado_em || null)
        setTermoConteudo(latest.conteudo || termoConteudo)
      }
      toast.success('Termo publicado com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar termo')
    } finally {
      setSavingTermo(false)
    }
  }

  // ── Tab renderer ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'loja':
        return (
          <form onSubmit={handleSaveStore}>
            <Card>
              <CardHead>
                <span className='icon material-symbols-outlined'>storefront</span>
                <h2>Dados da Loja</h2>
              </CardHead>
              <CardBody>
                <Grid>
                  <Field>
                    <Label>Nome da Loja *</Label>
                    <Input
                      value={form.storeName}
                      onChange={handleChange('storeName')}
                      required
                      placeholder='Ex: Açougue Bom Pedaço'
                    />
                  </Field>
                </Grid>

                <Grid $cols='1fr 1fr 1fr'>
                  <Field>
                    <Label>CNPJ</Label>
                    <Input
                      value={form.cnpj}
                      onChange={e => setForm(f => ({ ...f, cnpj: formatCNPJ(e.target.value) }))}
                      placeholder='00.000.000/0001-00'
                      inputMode='numeric'
                    />
                  </Field>
                  <Field>
                    <Label>Telefone</Label>
                    <Input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                      placeholder='(00) 00000-0000'
                      inputMode='numeric'
                    />
                  </Field>
                  <Field>
                    <Label>Instagram</Label>
                    <Input
                      value={form.instagram}
                      onChange={handleChange('instagram')}
                      placeholder='@sualoja'
                    />
                  </Field>
                </Grid>

                <Grid $cols='2fr 1fr'>
                  <Field>
                    <Label>Endereço</Label>
                    <Input
                      value={form.address}
                      onChange={handleChange('address')}
                      placeholder='Rua, número, bairro'
                    />
                  </Field>
                  <Field>
                    <Label>Cidade / UF</Label>
                    <Input
                      value={form.city}
                      onChange={handleChange('city')}
                      placeholder='São Paulo - SP'
                    />
                  </Field>
                </Grid>

                <Grid>
                  <Field>
                    <Label>Mensagem de Rodapé da Nota</Label>
                    <Input
                      value={form.footerMsg}
                      onChange={handleChange('footerMsg')}
                      placeholder='Obrigado pela preferência!'
                    />
                  </Field>
                </Grid>

                <SaveBtn type='submit'>
                  {storeSaved ? '✓ Salvo!' : 'Salvar Dados da Loja'}
                </SaveBtn>
              </CardBody>
            </Card>
          </form>
        )

      case 'financeiro':
        return (
          <Card>
            <CardHead>
              <span className='icon material-symbols-outlined'>account_balance</span>
              <h2>Parâmetros Financeiros</h2>
              {financeCreatedAt && (
                <p>Última versão: {new Date(financeCreatedAt).toLocaleString('pt-BR')}</p>
              )}
            </CardHead>
            <CardBody>
              {financeLoading ? (
                <InfoRow>
                  <span className='material-symbols-outlined'>sync</span>
                  Carregando configurações...
                </InfoRow>
              ) : (
                <>
                  <Grid $cols='1fr 1fr 1fr'>
                    <Field>
                      <Label>Lucro Esperado (%)</Label>
                      <Input
                        type='number'
                        min='0'
                        max='100'
                        step='0.01'
                        value={financeConfig.lucroEsperado}
                        onChange={e => setFinanceConfig(f => ({ ...f, lucroEsperado: e.target.value }))}
                        onBlur={e => setFinanceConfig(f => ({
                          ...f,
                          lucroEsperado: e.target.value === '' ? '' : Number(e.target.value).toFixed(2),
                        }))}
                        placeholder='20.00'
                      />
                    </Field>
                    <Field>
                      <Label>Taxa Débito (%)</Label>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={financeConfig.taxaDebito}
                        onChange={e => setFinanceConfig(f => ({ ...f, taxaDebito: e.target.value }))}
                        onBlur={e => setFinanceConfig(f => ({
                          ...f,
                          taxaDebito: e.target.value === '' ? '' : Number(e.target.value).toFixed(2),
                        }))}
                        placeholder='2.50'
                      />
                    </Field>
                    <Field>
                      <Label>Taxa Crédito (%)</Label>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={financeConfig.taxaCredito}
                        onChange={e => setFinanceConfig(f => ({ ...f, taxaCredito: e.target.value }))}
                        onBlur={e => setFinanceConfig(f => ({
                          ...f,
                          taxaCredito: e.target.value === '' ? '' : Number(e.target.value).toFixed(2),
                        }))}
                        placeholder='3.50'
                      />
                    </Field>
                  </Grid>

                  <Grid $cols='1fr 1fr 1fr'>
                    <Field>
                      <Label>Alerta de validade (dias)</Label>
                      <Input
                        type='number'
                        min='1'
                        value={form.expiryDays || 7}
                        onChange={e => setForm(f => ({ ...f, expiryDays: Number(e.target.value) }))}
                      />
                    </Field>
                    <Field>
                      <Label>Alerta de inatividade de cliente (dias)</Label>
                      <Input
                        type='number'
                        min='1'
                        value={form.clienteInativoDias || 30}
                        onChange={e => setForm(f => ({ ...f, clienteInativoDias: Number(e.target.value) }))}
                      />
                    </Field>
                    <Field>
                      <Label>Acréscimo no Crédito (PDV %)</Label>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        value={financeConfig.acrescimoCredito}
                        onChange={e => setFinanceConfig(f => ({ ...f, acrescimoCredito: e.target.value }))}
                        onBlur={e => setFinanceConfig(f => ({
                          ...f,
                          acrescimoCredito: e.target.value === '' ? '' : Number(e.target.value).toFixed(2),
                        }))}
                        placeholder='5.00'
                      />
                    </Field>
                    <Grid $cols='1fr 1fr 1fr'>
                  </Grid>
                  </Grid>

                  <InfoRow>
                    <span className='material-symbols-outlined'>info</span>
                    Cada salvamento cria uma nova versão histórica. O sistema sempre utiliza a versão mais recente.
                  </InfoRow>

                  <SaveBtn
                    type='button'
                    onClick={() => setFinanceConfirmOpen(true)}
                    disabled={savingFinance || financeLoading}
                  >
                    {savingFinance ? 'Salvando...' : 'Salvar Nova Versão'}
                  </SaveBtn>
                </>
              )}
            </CardBody>
          </Card>
        )

      case 'nota':
        return (
          <Card>
            <CardHead>
              <span className='icon material-symbols-outlined'>receipt_long</span>
              <h2>Prévia da Nota Fiscal (80mm)</h2>
            </CardHead>
            <CardBody>
              <InfoRow>
                <span className='material-symbols-outlined'>info</span>
                Simulação baseada nos dados atuais da aba "Dados da Loja". Salve as configurações para atualizar.
              </InfoRow>
              <Preview>{buildPreview(form)}</Preview>
            </CardBody>
          </Card>
        )

      case 'termos':
        return (
          <Card>
            <CardHead>
              <span className='icon material-symbols-outlined'>description</span>
              <h2>Termos e Condições</h2>
              {termoId && termoCriadoEm && (
                <p>Versão {termoId} — {new Date(termoCriadoEm).toLocaleString('pt-BR')}</p>
              )}
            </CardHead>
            <CardBody>
              {termoLoading ? (
                <InfoRow>
                  <span className='material-symbols-outlined'>sync</span>
                  Carregando termos...
                </InfoRow>
              ) : (
                <>
                  {!termoId && (
                    <InfoRow>
                      <span className='material-symbols-outlined'>info</span>
                      Nenhuma versão registrada. Escreva o conteúdo e publique para criar a primeira versão.
                    </InfoRow>
                  )}

                  <TextArea
                    value={termoConteudo}
                    onChange={e => setTermoConteudo(e.target.value)}
                    placeholder='Escreva os termos e condições aqui...'
                  />

                  <InfoRow>
                    <span className='material-symbols-outlined'>history</span>
                    Cada publicação cria uma nova versão imutável. Clientes sempre visualizam a versão vigente.
                  </InfoRow>

                  <SaveBtn
                    type='button'
                    onClick={() => setTermoConfirmOpen(true)}
                    disabled={savingTermo}
                  >
                    {savingTermo ? 'Salvando...' : 'Publicar Nova Versão'}
                  </SaveBtn>
                </>
              )}
            </CardBody>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='config-loja' />
      <Main>
        <TopBar>
          <span className='icon material-symbols-outlined'>settings</span>
          <h1>Configurações</h1>
        </TopBar>

        <TabBar>
          {TABS.map(tab => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              type='button'
            >
              <span className='material-symbols-outlined'>{tab.icon}</span>
              {tab.label}
            </Tab>
          ))}
        </TabBar>

        <Content>
          {renderTab()}
        </Content>
      </Main>

      <ConfirmModal
        open={financeConfirmOpen}
        title='Salvar parâmetros financeiros'
        message='Deseja criar uma nova versão dos parâmetros financeiros? O histórico de versões anteriores será mantido.'
        onCancel={() => setFinanceConfirmOpen(false)}
        onConfirm={async () => { setFinanceConfirmOpen(false); await saveFinance() }}
        confirmLabel='Salvar versão'
        loading={savingFinance}
      />

      <ConfirmModal
        open={termoConfirmOpen}
        title='Publicar nova versão dos termos'
        message='Deseja publicar esta versão dos Termos e Condições? A nova versão será registrada com a data e hora atual.'
        onCancel={() => setTermoConfirmOpen(false)}
        onConfirm={async () => { setTermoConfirmOpen(false); await saveTermo() }}
        confirmLabel='Publicar'
        loading={savingTermo}
      />
    </Wrapper>
  )
}

export default ConfiguracaoView
