import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { toast } from 'react-toastify'

const Wrapper = styled.div`
  display: flex; min-height: 100vh; background: var(--bg);
  font-family: 'Work Sans', sans-serif;
`
const Main = styled.main`flex: 1; display: flex; flex-direction: column; min-width: 0;`
const TopBar = styled.div`
  background: var(--sidebar-bg); padding: 14px 28px;
  display: flex; align-items: center; gap: 12px;
  span { color: rgba(255,255,255,0.4); font-size: 20px; }
  h1 { font-family: 'Epilogue',sans-serif; font-size: 16px; font-weight: 900;
       color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
`
const Content = styled.div`
  padding: 28px; display: flex; flex-direction: column; gap: 24px;
  max-width: 720px;
`
const Card = styled.div`
  background: #fff; border-radius: 14px; border: 1px solid var(--border);
  overflow: hidden;
`
const CardHead = styled.div`
  padding: 16px 22px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
  h2 { font-family: 'Epilogue',sans-serif; font-size: 14px; font-weight: 900;
       text-transform: uppercase; letter-spacing: 0.05em; color: var(--text); margin: 0; }
  span { color: var(--brand); font-size: 18px; }
`
const CardBody = styled.div`padding: 22px;`
const Grid = styled.div`
  display: grid; gap: 16px;
  grid-template-columns: ${p => p.$cols || '1fr'};
`
const Field = styled.div`display: flex; flex-direction: column; gap: 5px;`
const Label = styled.label`
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--muted);
`
const Input = styled.input`
  padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
  font-size: 14px; font-family: 'Work Sans',sans-serif;
  &:focus { outline: none; border-color: var(--brand); }
`
const SaveBtn = styled.button`
  padding: 11px 24px; background: var(--brand); color: #fff;
  border: none; border-radius: var(--radius); font-family: 'Epilogue',sans-serif;
  font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;
  cursor: pointer; width: 100%;
  &:hover { background: var(--brand-hover); }
`
const Preview = styled.div`
  background: #1c1917; color: #fff; border-radius: 10px; padding: 20px;
  font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;
  white-space: pre;
`
const Divider = styled.div`
  border-top: 1px dashed #444; margin: 6px 0;
`

const STORAGE_KEY = 'carneup_store_config'

const DEFAULT_CONFIG = {
  storeName:    'Açougue Bom Pedaço',
  cnpj:         '12.345.678/0001-90',
  address:      'Rua das Carnes, 42 - Centro',
  city:         'São Paulo - SP',
  phone:        '(11) 3456-7890',
  footerMsg:    'Obrigado pela preferência!',
}

export const loadStoreConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG }
  } catch { return { ...DEFAULT_CONFIG } }
}

export const ConfiguracaoView = ({ navigate }) => {
  const [form, setForm] = useState(loadStoreConfig)
  const [saved, setSaved] = useState(false)

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(true)
    toast.success('Configurações salvas com sucesso!')
    setTimeout(() => setSaved(false), 3000)
  }

  const center = (str, width = 32) => {
    const pad = Math.max(0, width - str.length)
    return ' '.repeat(Math.floor(pad / 2)) + str + ' '.repeat(Math.ceil(pad / 2))
  }
  const line = (label, value, width = 32) => {
    const avail = width - label.length - 1
    const val = value.length > avail ? value.slice(0, avail) : value.padStart(avail)
    return `${label} ${val}`
  }

  const preview = [
    center(form.storeName.toUpperCase()),
    form.cnpj ? `CNPJ: ${form.cnpj}` : '',
    form.address || '',
    form.city || '',
    form.phone ? `Tel: ${form.phone}` : '',
    '--------------------------------',
    `DATA: ${new Date().toLocaleString('pt-BR')}`,
    '--------------------------------',
    line('PICANHA 1.200KG', 'R$ 82,80'),
    line('COSTELA  0.800KG', 'R$ 38,40'),
    '- - - - - - - - - - - - - - - -',
    line('SUBTOTAL', 'R$ 121,20'),
    line('TOTAL', 'R$ 121,20'),
    line('PAGAMENTO', 'PIX'),
    '--------------------------------',
    center(form.footerMsg),
  ].filter(Boolean).join('\n')

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='configuracoes' />
      <Main>
        <TopBar>
          <span className='material-symbols-outlined'>store</span>
          <h1>Configurações da Loja</h1>
        </TopBar>
        <Content>
          <form onSubmit={handleSave}>
            <Card style={{ marginBottom: 20 }}>
              <CardHead>
                <span className='material-symbols-outlined'>storefront</span>
                <h2>Dados da Loja</h2>
              </CardHead>
              <CardBody>
                <Grid style={{ marginBottom: 14 }}>
                  <Field>
                    <Label>Nome da Loja *</Label>
                    <Input value={form.storeName} onChange={handleChange('storeName')} required placeholder='Ex: Açougue Bom Pedaço' />
                  </Field>
                </Grid>
                <Grid $cols='1fr 1fr' style={{ marginBottom: 14 }}>
                  <Field>
                    <Label>CNPJ</Label>
                    <Input value={form.cnpj} onChange={handleChange('cnpj')} placeholder='00.000.000/0001-00' />
                  </Field>
                  <Field>
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={handleChange('phone')} placeholder='(00) 0000-0000' />
                  </Field>
                </Grid>
                <Grid style={{ marginBottom: 14 }}>
                  <Field>
                    <Label>Endereço</Label>
                    <Input value={form.address} onChange={handleChange('address')} placeholder='Rua, número, bairro' />
                  </Field>
                </Grid>
                <Grid style={{ marginBottom: 14 }}>
                  <Field>
                    <Label>Cidade / UF</Label>
                    <Input value={form.city} onChange={handleChange('city')} placeholder='São Paulo - SP' />
                  </Field>
                </Grid>
                <Grid style={{ marginBottom: 20 }}>
                  <Field>
                    <Label>Mensagem de Rodapé da Nota</Label>
                    <Input value={form.footerMsg} onChange={handleChange('footerMsg')} placeholder='Ex: Obrigado pela preferência!' />
                  </Field>
                </Grid>
                <SaveBtn type='submit'>{saved ? '✓ Salvo!' : 'Salvar Configurações'}</SaveBtn>
              </CardBody>
            </Card>
          </form>

          <Card>
            <CardHead>
              <span className='material-symbols-outlined'>receipt_long</span>
              <h2>Prévia da Nota (80mm)</h2>
            </CardHead>
            <CardBody>
              <Preview>{preview}</Preview>
            </CardBody>
          </Card>
        </Content>
      </Main>
    </Wrapper>
  )
}

export default ConfiguracaoView
