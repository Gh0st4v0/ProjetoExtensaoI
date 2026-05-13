import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { getUsers, createUser, deleteUser } from '../services/usersApi'
import { toast } from 'react-toastify'

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
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  margin: 0;
  color: #1a1c1c;
`
const SectionDescription = styled.p`
  margin: 4px 0 0;
  color: #5a403c;
  font-size: 15px;
`
const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #610005;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-family: 'Epilogue', sans-serif;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  &:hover { background-color: #7f1d1d; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
const UsersGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (min-width: 1280px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`
const UserCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #e5e7eb;
  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .avatar {
    width: 48px; height: 48px; border-radius: 9999px;
    background: #ffdad6; color: #610005;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 18px;
  }
  span.badge {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.12em; padding: 5px 10px; border-radius: 9999px;
    background: ${p => p.$adm ? '#fef2f2' : '#e0f2fe'};
    color: ${p => p.$adm ? '#b91c1c' : '#0369a1'};
  }
  h3 { margin: 0; font-size: 17px; font-weight: 900; font-family: 'Epilogue', sans-serif; }
  p { margin: 0; color: #6b7280; font-size: 13px; }
  .footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 12px; border-top: 1px solid #e5e7eb;
    color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
  }
`
const AddCard = styled.button`
  background: #fff; border: 2px dashed #e5e7eb; border-radius: 16px;
  padding: 24px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; color: #6b7280; font-weight: 700; font-size: 14px;
  transition: border-color 0.2s;
  &:hover { border-color: #610005; color: #610005; }
`

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 60;
`
const Modal = styled.div`
  width: 480px; max-width: calc(100% - 32px);
  background: #fff; border-radius: 16px; padding: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
`
const ModalTitle = styled.h2`
  font-family: 'Epilogue', sans-serif; font-weight: 900; color: #610005;
  margin: 0 0 20px; font-size: 20px; text-transform: uppercase;
`
const Field = styled.div`margin-bottom: 14px;`
const FieldLabel = styled.label`
  font-size: 10px; font-weight: 700; color: #6b7280;
  letter-spacing: 0.15em; text-transform: uppercase; display: block; margin-bottom: 6px;
`
const FieldInput = styled.input`
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
  box-sizing: border-box;
`
const FieldSelect = styled.select`
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
`
const ModalActions = styled.div`display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;`
const BtnSecondary = styled.button`
  padding: 10px 18px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 13px; font-family: 'Work Sans', sans-serif;
`
const BtnPrimary = styled.button`
  padding: 10px 18px; border: none; border-radius: 8px;
  background: #610005; color: #fff; cursor: pointer;
  font-size: 13px; font-family: 'Epilogue', sans-serif; font-weight: 700;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export const SettingsView = ({ navigate }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivelAcesso: 'USUARIO' })

  const load = useCallback(() => {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch(() => toast.error('Erro ao carregar usuários.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este usuário?')) return
    try {
      await deleteUser(id)
      toast.success('Usuário removido.')
      load()
    } catch {
      toast.error('Erro ao remover usuário.')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createUser(form)
      toast.success('Usuário criado com sucesso!')
      setModalOpen(false)
      setForm({ nome: '', email: '', senha: '', nivelAcesso: 'USUARIO' })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao criar usuário.')
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (nome) => nome ? nome.slice(0, 2).toUpperCase() : '?'

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='configuracoes' />
      <MainArea>
        <Topbar searchQuery='' onSearchChange={() => {}} />
        <PageContent>
          <PageHeader>
            <div>
              <SectionTitle>Gerenciar Usuários</SectionTitle>
              <SectionDescription>Controle de acesso e cargos da equipe CarneUp.</SectionDescription>
            </div>
            <ActionButton onClick={() => setModalOpen(true)}>
              <span className='material-symbols-outlined'>person_add</span>
              Adicionar Colaborador
            </ActionButton>
          </PageHeader>

          {loading ? (
            <p style={{ color: '#78716c' }}>Carregando usuários...</p>
          ) : (
            <UsersGrid>
              {users.map(u => (
                <UserCard key={u.id} $adm={u.nivelAcesso === 'ADM'}>
                  <div className='top'>
                    <div className='avatar'>{initials(u.nome)}</div>
                    <span className='badge'>{u.nivelAcesso === 'ADM' ? 'Admin' : 'Operador'}</span>
                  </div>
                  <h3>{u.nome}</h3>
                  <p>{u.email}</p>
                  <div className='footer'>
                    <span>{u.nivelAcesso === 'ADM' ? 'Acesso Total' : 'Acesso Básico'}</span>
                    <button type='button' onClick={() => handleDelete(u.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>
                      <span className='material-symbols-outlined' style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </UserCard>
              ))}
              <AddCard onClick={() => setModalOpen(true)}>
                <span className='material-symbols-outlined' style={{ fontSize: 32 }}>add_circle</span>
                Novo Colaborador
              </AddCard>
            </UsersGrid>
          )}
        </PageContent>
      </MainArea>

      {modalOpen && (
        <Backdrop onClick={() => setModalOpen(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>Novo Usuário</ModalTitle>
            <form onSubmit={handleCreate}>
              <Field>
                <FieldLabel>Nome *</FieldLabel>
                <FieldInput value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
              </Field>
              <Field>
                <FieldLabel>E-mail *</FieldLabel>
                <FieldInput type='email' value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </Field>
              <Field>
                <FieldLabel>Senha *</FieldLabel>
                <FieldInput type='password' value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required />
              </Field>
              <Field>
                <FieldLabel>Nível de Acesso</FieldLabel>
                <FieldSelect value={form.nivelAcesso} onChange={e => setForm(f => ({ ...f, nivelAcesso: e.target.value }))}>
                  <option value='USUARIO'>Operador (Acesso Básico)</option>
                  <option value='ADM'>Admin (Acesso Total)</option>
                </FieldSelect>
              </Field>
              <ModalActions>
                <BtnSecondary type='button' onClick={() => setModalOpen(false)}>Cancelar</BtnSecondary>
                <BtnPrimary type='submit' disabled={submitting}>{submitting ? 'Salvando...' : 'Criar Usuário'}</BtnPrimary>
              </ModalActions>
            </form>
          </Modal>
        </Backdrop>
      )}
    </Wrapper>
  )
}
