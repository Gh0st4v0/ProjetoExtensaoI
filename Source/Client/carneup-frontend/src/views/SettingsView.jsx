import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { SectionCard } from '../components/SectionCard'
import { SettingsInput } from '../components/SettingsInput'
import usersApi from '../services/usersApi'

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9f9f9;
  color: #111827;
`

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const PageContent = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`

const SectionTitle = styled.h1`
  font-family: 'Epilogue', sans-serif;
  font-size: 28px;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0;
  color: #610005;
`

const SectionDescription = styled.p`
  margin: 0;
  color: #5a403c;
  font-size: 14px;
  max-width: 680px;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #610005;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  font-family: 'Epilogue', sans-serif;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    background-color: #7f1d1d;
  }

  &:active {
    transform: scale(0.98);
  }
`

const UsersSection = styled.section`
  display: grid;
  gap: 12px;
`

const UsersHint = styled.p`
  margin: 0;
  color: #78716c;
  font-size: 12px;
`

const UsersGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
`

const UserCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e7eb;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffdad6;
    color: #610005;
    font-family: 'Epilogue', sans-serif;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .details {
    flex: 1;
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
    font-family: 'Epilogue', sans-serif;
    color: #111827;
  }

  p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }

  span.badge {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding: 6px 10px;
    border-radius: 9999px;
    background: #fef2f2;
    color: #b91c1c;
  }

  button {
    width: 36px;
    height: 36px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    color: #b91c1c;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #fff8f7;
      border-color: #ffdad6;
    }
  }
`

const SettingsGrid = styled.div`
  display: grid;
  gap: 32px;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
`

const SettingsCard = styled.section`
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid #f3f4f6;
`

const SettingsCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`

const SettingsCardTitle = styled.h2`
  margin: 0;
  font-family: 'Epilogue', sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: -0.05em;
`

const SettingsCardCaption = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
`

const FormGrid = styled.div`
  display: grid;
  gap: 24px;
`

const FormRow = styled.div`
  display: grid;
  gap: 10px;
`

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const CheckboxList = styled.div`
  display: grid;
  gap: 12px;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  cursor: pointer;
  font-size: 14px;
  color: #111827;

  input {
    accent-color: #b91c1c;
    width: 18px;
    height: 18px;
  }
`

const SaveButton = styled.button`
  margin-top: 16px;
  background: #610005;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  padding: 14px 22px;
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    transform: scale(0.98);
  }
`

const PreviewCard = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: relative;
  overflow: hidden;
  background: #111827;
  color: #f8fafc;

  .stripe {
    position: absolute;
    top: -20px;
    right: -20px;
    opacity: 0.08;
    font-size: 120px;
  }

  .content {
    position: relative;
    z-index: 1;
  }

  .preview-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-family: 'Work Sans', sans-serif;
    font-size: 14px;
  }

  .total {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-weight: 800;
    font-size: 16px;
  }
`

const TipsGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const TipCard = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;

  span.icon {
    color: ${(props) => props.color || '#991b1b'};
    font-size: 28px;
  }

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }
`

const normalizeUser = (user) => ({
  id: user.id ?? user.userId ?? '',
  name: user.name ?? user.userName ?? user.nome ?? 'Usuário',
  email: user.email ?? '',
  accessLevel: user.accessLevel ?? user.role ?? user.nivelAcesso ?? 'USUARIO',
})

const getInitials = (name) => String(name || 'Usuário')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0])
  .join('') || 'U'

const getAccessLabel = (accessLevel) => {
  if (accessLevel === 'ADM') return 'Administrador'
  return accessLevel || 'Usuário'
}

export const SettingsView = ({ navigate }) => {
  const currentUser = {
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('userName') || 'Usuário',
    accessLevel: localStorage.getItem('accessLevel') || 'USUARIO',
  }
  const fallbackUsers = [currentUser]
  const [users, setUsers] = useState(fallbackUsers)
  const [usersSource, setUsersSource] = useState('session')

  const [settings, setSettings] = useState({
    unitName: 'CarneUp Matriz - Centro',
    cnpj: '00.000.000/0001-00',
    showWeight: true,
    loyaltyQRCode: false,
  })

  const handleFieldChange = (field) => (event) => {
    setSettings((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  useEffect(() => {
    let mounted = true

    const loadUsers = async () => {
      try {
        const data = await usersApi.getUsers()
        if (!mounted) return
        const normalized = (Array.isArray(data) ? data : data?.content || []).map(normalizeUser)
        setUsers(normalized.length ? normalized : fallbackUsers)
        setUsersSource(normalized.length ? 'api' : 'session')
      } catch {
        if (!mounted) return
        setUsers(fallbackUsers)
        setUsersSource('session')
      }
    }

    loadUsers()
    return () => { mounted = false }
  }, [])

  const toggleSetting = (field) => {
    setSettings((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='configuracoes' />
      <MainArea>
        <Topbar title='Configurações' />
        <PageContent>
          <PageHeader>
            <div>
              <SectionTitle>Configurações</SectionTitle>
              <SectionDescription>
                Preferências locais, dados da sessão e ajustes visuais do sistema.
              </SectionDescription>
            </div>
            <HeaderActions>
              <ActionButton type='button' onClick={() => navigate('dashboard')}>
                <span className='material-symbols-outlined'>dashboard</span>
                Voltar ao Painel
              </ActionButton>
            </HeaderActions>
          </PageHeader>

          <UsersSection>
            <UsersHint>
              {usersSource === 'api'
                ? 'Usuários carregados pelo backend.'
                : 'Exibindo usuário da sessão. Quando o backend enviar a lista de usuários em /users, esta área será preenchida automaticamente.'}
            </UsersHint>
            <UsersGrid>
              {users.map((user) => (
                <UserCard key={user.id || user.name}>
                  <div className='avatar'>{getInitials(user.name)}</div>
                  <div className='details'>
                    <h3>{user.name}</h3>
                    <p>{user.email || (user.id ? `ID ${user.id}` : 'Sessão ativa')}</p>
                    <div className='meta'>
                      <span className='badge'>{getAccessLabel(user.accessLevel)}</span>
                    </div>
                  </div>
                  <button type='button' onClick={() => navigate('login')} title='Trocar usuário'>
                    <span className='material-symbols-outlined'>manage_accounts</span>
                  </button>
                </UserCard>
              ))}
            </UsersGrid>
          </UsersSection>

          <SettingsGrid>
            <SettingsCard>
              <SettingsCardHeader>
                <SettingsCardTitle>Configurações do Sistema</SettingsCardTitle>
                <SettingsCardCaption>
                  Defina o comportamento do comprovante, da unidade e do layout do sistema.
                </SettingsCardCaption>
              </SettingsCardHeader>

              <FormGrid>
                <FormRow>
                  <FieldLabel>Nome da Unidade</FieldLabel>
                  <SettingsInput
                    type='text'
                    value={settings.unitName}
                    onChange={handleFieldChange('unitName')}
                    placeholder='Nome da unidade'
                  />
                </FormRow>
                <FormRow>
                  <FieldLabel>CNPJ Operacional</FieldLabel>
                  <SettingsInput
                    type='text'
                    value={settings.cnpj}
                    onChange={handleFieldChange('cnpj')}
                    placeholder='00.000.000/0001-00'
                  />
                </FormRow>
                <CheckboxList>
                  <CheckboxLabel>
                    <input
                      type='checkbox'
                      checked={settings.showWeight}
                      onChange={() => toggleSetting('showWeight')}
                    />
                    Exibir Peso por Peça
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type='checkbox'
                      checked={settings.loyaltyQRCode}
                      onChange={() => toggleSetting('loyaltyQRCode')}
                    />
                    QR Code de Fidelidade
                  </CheckboxLabel>
                </CheckboxList>
                <SaveButton type='button'>Salvar Alterações</SaveButton>
              </FormGrid>
            </SettingsCard>

            <PreviewCard title='Preview do Cupom' caption='Visualize o layout do comprovante antes de salvar.'>
              <span className='stripe material-symbols-outlined'>receipt_long</span>
              <div className='content'>
                <div className='preview-row'>
                  <span>Picanha Argentina 1.2kg</span>
                  <span>R$ 142,80</span>
                </div>
                <div className='preview-row'>
                  <span>Linguiça Artesanal</span>
                  <span>R$ 28,90</span>
                </div>
                <div className='total'>
                  <span>TOTAL</span>
                  <span>R$ 171,70</span>
                </div>
              </div>
            </PreviewCard>
          </SettingsGrid>

          <SectionCard title='Dicas de Uso & Suporte'>
            <TipsGrid>
              <TipCard>
                <span className='material-symbols-outlined icon'>inventory</span>
                <h4>Ajuste de Estoque</h4>
                <p>Saiba como realizar baixas manuais por quebra ou consumo interno.</p>
              </TipCard>
              <TipCard color='#1d4ed8'>
                <span className='material-symbols-outlined icon'>scale</span>
                <h4>Integração Balança</h4>
                <p>Configuração de protocolos seriais para balanças Prix e Filizola.</p>
              </TipCard>
              <TipCard color='#4338ca'>
                <span className='material-symbols-outlined icon'>query_stats</span>
                <h4>Relatórios de Margem</h4>
                <p>Entenda como o CarneUp calcula seu CMV em tempo real.</p>
              </TipCard>
              <TipCard color='#047857'>
                <span className='material-symbols-outlined icon'>credit_card</span>
                <h4>Taxas de Cartão</h4>
                <p>Configure suas taxas para ter o valor líquido correto nos relatórios.</p>
              </TipCard>
            </TipsGrid>
          </SectionCard>
        </PageContent>
      </MainArea>
    </Wrapper>
  )
}
