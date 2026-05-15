import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { getUsers, createUser, updateUser, deleteUser } from '../services/usersApi'
import { toast } from 'react-toastify'
import { toTitleCase } from '../services/textUtils'

// ── Styles ────────────────────────────────────────────────────────────────────

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
  border: 1px solid ${p => p.$self ? '#610005' : '#e5e7eb'};
  box-shadow: ${p => p.$self ? '0 0 0 2px #ffdad6' : 'none'};
  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .avatar {
    width: 48px; height: 48px; border-radius: 9999px;
    background: ${p => p.$self ? '#610005' : '#ffdad6'};
    color: ${p => p.$self ? '#fff' : '#610005'};
    display: flex; align-items: center; justify-content: center;
    font-family: 'Epilogue', sans-serif; font-weight: 900; font-size: 18px;
  }
  .badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  span.badge {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.12em; padding: 5px 10px; border-radius: 9999px;
    background: ${p => p.$adm ? '#fef2f2' : '#e0f2fe'};
    color: ${p => p.$adm ? '#b91c1c' : '#0369a1'};
  }
  span.self-badge {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.12em; padding: 5px 10px; border-radius: 9999px;
    background: #610005; color: #fff;
  }
  h3 { margin: 0; font-size: 17px; font-weight: 900; font-family: 'Epilogue', sans-serif; }
  p { margin: 0; color: #6b7280; font-size: 13px; }
  .footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 12px; border-top: 1px solid #e5e7eb;
    color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
  }
  .actions { display: flex; gap: 4px; }
`
const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.$danger ? '#b91c1c' : '#6b7280'};
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &:hover { color: ${p => p.$danger ? '#991b1b' : '#610005'}; background: #f5f5f4; }
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
const InfoBanner = styled.div`
  background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;
  padding: 10px 14px; margin-bottom: 16px;
  font-size: 13px; color: #92400e; display: flex; gap: 8px; align-items: flex-start;
`
const Field = styled.div`margin-bottom: 14px;`
const FieldLabel = styled.label`
  font-size: 10px; font-weight: 700; color: #6b7280;
  letter-spacing: 0.15em; text-transform: uppercase; display: block; margin-bottom: 6px;
`
const FieldInput = styled.input`
  width: 100%; padding: 10px 12px;
  border: 1px solid ${p => p.$error ? '#ba1a1a' : '#e5e7eb'};
  border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #610005; }
`
const FieldSelect = styled.select`
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 14px; font-family: 'Work Sans', sans-serif;
`
const FieldError = styled.p`color: #ba1a1a; font-size: 11px; margin: 4px 0 0;`
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

// ── Component ─────────────────────────────────────────────────────────────────

const EMPTY_FORM = { nome: '', email: '', senha: '', confirmar: '', nivelAcesso: 'USUARIO' }

export const SettingsView = ({ navigate }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', user: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loggedUserId = Number(localStorage.getItem('userId'))

  const load = useCallback(() => {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch(() => toast.error('Erro ao carregar usuários.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // ── Modal helpers ──
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModal({ open: true, mode: 'create', user: null })
  }

  const openEdit = (user) => {
    setForm({ nome: user.nome, email: user.email || '', senha: '', confirmar: '', nivelAcesso: user.nivelAcesso || 'USUARIO' })
    setFormErrors({})
    setModal({ open: true, mode: 'edit', user })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', user: null })
    setFormErrors({})
  }

  // ── Validation ──
  const validate = () => {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.'
    if (!form.email.trim()) errs.email = 'E-mail é obrigatório.'
    if (modal.mode === 'create' && !form.senha) errs.senha = 'Senha é obrigatória.'
    if (form.senha && form.senha.length < 4) errs.senha = 'Senha deve ter pelo menos 4 caracteres.'
    if (form.senha && form.senha !== form.confirmar) errs.confirmar = 'As senhas não coincidem.'
    if (!form.senha && form.confirmar) errs.confirmar = 'Preencha a nova senha antes de confirmar.'
    return errs
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setFormErrors({})

    // Idempotência: se já existe usuário com mesmo nome ou e-mail → editar em vez de criar
    if (modal.mode === 'create') {
      const existing = users.find(u =>
        u.nome.toLowerCase() === form.nome.trim().toLowerCase() ||
        u.email.toLowerCase() === form.email.trim().toLowerCase()
      )
      if (existing) {
        openEdit(existing)
        toast.info(`O usuário "${existing.nome}" já existe. Edite os dados abaixo e salve.`)
        return
      }
    }

    setSubmitting(true)
    try {
      if (modal.mode === 'create') {
        await createUser({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, nivelAcesso: form.nivelAcesso })
        toast.success('Usuário criado com sucesso!')
      } else {
        const payload = { nome: form.nome.trim(), email: form.email.trim(), nivelAcesso: form.nivelAcesso }
        if (form.senha) payload.senha = form.senha
        await updateUser(modal.user.id, payload)
        toast.success('Usuário atualizado com sucesso!')
      }
      closeModal()
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar usuário.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ──
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

  const initials = (nome) => nome ? nome.slice(0, 2).toUpperCase() : '?'

  const isEditMode = modal.mode === 'edit'

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='configuracoes' />
      <MainArea>
        <Topbar title='Configurações' />
        <PageContent>
          <PageHeader>
            <div>
              <SectionTitle>Gerenciar Usuários</SectionTitle>
              <SectionDescription>Controle de acesso e cargos da equipe CarneUp.</SectionDescription>
            </div>
            <ActionButton onClick={openCreate}>
              <span className='material-symbols-outlined'>person_add</span>
              Adicionar Colaborador
            </ActionButton>
          </PageHeader>

          {loading ? (
            <p style={{ color: '#78716c' }}>Carregando usuários...</p>
          ) : (
            <UsersGrid>
              {users.map(u => {
                const isSelf = u.id === loggedUserId
                return (
                  <UserCard key={u.id} $adm={u.nivelAcesso === 'ADM'} $self={isSelf}>
                    <div className='top'>
                      <div className='avatar'>{initials(u.nome)}</div>
                      <div className='badges'>
                        {isSelf && <span className='self-badge'>Você</span>}
                        <span className='badge'>{u.nivelAcesso === 'ADM' ? 'Admin' : 'Operador'}</span>
                      </div>
                    </div>
                    <h3>{u.nome}</h3>
                    <p>{u.email}</p>
                    <div className='footer'>
                      <span>{u.nivelAcesso === 'ADM' ? 'Acesso Total' : 'Acesso Básico'}</span>
                      <div className='actions'>
                        <IconBtn type='button' onClick={() => openEdit(u)} title='Editar usuário'>
                          <span className='material-symbols-outlined' style={{ fontSize: 18 }}>edit</span>
                        </IconBtn>
                        {!isSelf && (
                          <IconBtn type='button' $danger onClick={() => handleDelete(u.id)} title='Remover usuário'>
                            <span className='material-symbols-outlined' style={{ fontSize: 18 }}>delete</span>
                          </IconBtn>
                        )}
                      </div>
                    </div>
                  </UserCard>
                )
              })}
              <AddCard onClick={openCreate}>
                <span className='material-symbols-outlined' style={{ fontSize: 32 }}>add_circle</span>
                Novo Colaborador
              </AddCard>
            </UsersGrid>
          )}
        </PageContent>
      </MainArea>

      {modal.open && (
        <Backdrop onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{isEditMode ? 'Editar Usuário' : 'Novo Usuário'}</ModalTitle>

            {isEditMode && (
              <InfoBanner>
                <span className='material-symbols-outlined' style={{ fontSize: 18, flexShrink: 0 }}>info</span>
                <span>Deixe os campos de senha em branco para manter a senha atual.</span>
              </InfoBanner>
            )}

            <form onSubmit={handleSubmit}>
              <Field>
                <FieldLabel>Nome *</FieldLabel>
                <FieldInput
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: toTitleCase(e.target.value) }))}
                  $error={!!formErrors.nome}
                  required
                />
                {formErrors.nome && <FieldError>{formErrors.nome}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>E-mail *</FieldLabel>
                <FieldInput
                  type='email'
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  $error={!!formErrors.email}
                  required
                />
                {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>{isEditMode ? 'Nova Senha' : 'Senha *'}</FieldLabel>
                <FieldInput
                  type='password'
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  $error={!!formErrors.senha}
                  placeholder={isEditMode ? 'Deixe em branco para não alterar' : ''}
                />
                {formErrors.senha && <FieldError>{formErrors.senha}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>{isEditMode ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}</FieldLabel>
                <FieldInput
                  type='password'
                  value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                  $error={!!formErrors.confirmar}
                  placeholder={isEditMode ? 'Deixe em branco para não alterar' : ''}
                />
                {formErrors.confirmar && <FieldError>{formErrors.confirmar}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Nível de Acesso</FieldLabel>
                <FieldSelect value={form.nivelAcesso} onChange={e => setForm(f => ({ ...f, nivelAcesso: e.target.value }))}>
                  <option value='USUARIO'>Operador (Acesso Básico)</option>
                  <option value='ADM'>Admin (Acesso Total)</option>
                </FieldSelect>
              </Field>

              <ModalActions>
                <BtnSecondary type='button' onClick={closeModal}>Cancelar</BtnSecondary>
                <BtnPrimary type='submit' disabled={submitting}>
                  {submitting ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
                </BtnPrimary>
              </ModalActions>
            </form>
          </Modal>
        </Backdrop>
      )}
    </Wrapper>
  )
}
