import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import ConfirmModal from '../components/ConfirmModal'
import { getDespesas, createDespesa, updateDespesa, deleteDespesa } from '../services/despesasApi'
import { usePagination } from '../services/usePagination'
import { toast } from 'react-toastify'

// ── Styles ──────────────────────────────────────────────────────────────────
const Wrapper = styled.div`display:flex; min-height:100vh; background:var(--bg, #f9f9f9);`
const MainArea = styled.main`flex:1; display:flex; flex-direction:column;`
const ContentContainer = styled.div`padding:32px; max-width:1280px; margin:0 auto; width:100%; display:flex; flex-direction:column; gap:24px;`
const PageHeader = styled.div`display:flex; justify-content:space-between; align-items:center;`

// Modal Styles (do ReportsView)
const EditModalOverlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,0.45);
  display:flex;align-items:center;justify-content:center;z-index:200;
`
const EditModal = styled.div`
  background:#fff;border-radius:16px;width:480px;max-width:calc(100%-32px);
  max-height:90vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.18);
`
const EMHead = styled.div`
  padding:18px 22px 14px;border-bottom:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;
  h2{font-family:'Epilogue',sans-serif;font-size:17px;font-weight:900;color:var(--text);margin:0;}
  button{background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;
    &:hover{color:var(--danger);}span{font-size:20px;}}
`
const EMBody = styled.div`padding:18px 22px;`
const EMField = styled.div`
  margin-bottom:14px;
  label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;
    letter-spacing:0.12em;color:var(--muted);margin-bottom:5px;}
  input, select{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);
    font-size:13px;font-family:'Work Sans',sans-serif;box-sizing:border-box;background:var(--bg);
    &:focus{outline:none;border-color:var(--brand);background:#fff;}
  }
  small{font-size:10px;color:var(--muted);margin-top:3px;display:block;}
`
const EMActions = styled.div`display:flex;gap:8px;padding:0 22px 18px;`
const EMCancel = styled.button`
  flex:1;padding:10px;border:1px solid var(--border);border-radius:var(--radius);
  background:#fff;cursor:pointer;font-size:13px;color:var(--text-sub);
  &:hover{background:var(--bg);}
`
const EMDelete = styled.button`
  flex:1;padding:10px;border:none;border-radius:var(--radius);
  background:var(--danger);color:#fff;cursor:pointer;font-size:13px;
  &:hover{background:#b91c1c;}
  &:disabled{opacity:0.6;cursor:not-allowed;}
`
const EMSave = styled.button`
  flex:2;padding:10px;border:none;border-radius:var(--radius);
  background:var(--brand);color:#fff;cursor:pointer;
  font-family:'Epilogue',sans-serif;font-weight:900;font-size:13px;text-transform:uppercase;
  &:hover{background:var(--brand-hover);}
  &:disabled{opacity:0.5;cursor:not-allowed;}
`

const formatCurrency = (v) => v == null ? '' : `R$ ${Number(v).toFixed(2)}`
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : ''

export const DespesasView = ({ navigate }) => {
  const [despesas, setDespesas] = useState([])
  const [loading, setLoading] = useState(true)
  const { page, setPage, totalPages, totalItems, currentItems } = usePagination(despesas)

  // Estados Unificados do Modal (Criação e Edição)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editDespesa, setEditDespesa] = useState(null) // null = nova despesa
  const [editDespesaForm, setEditDespesaForm] = useState({ descricao: '', categoria: '', valor: '', dataDespesa: '' })
  const [editDespesaSaving, setEditDespesaSaving] = useState(false)

  // Estados de Exclusão
  const [deleteDespesaConfirm, setDeleteDespesaConfirm] = useState(false)
  const [deleteDespesaLoading, setDeleteDespesaLoading] = useState(false)

  const defaultEnd = new Date()
  const defaultStart = new Date()
  defaultStart.setDate(defaultEnd.getDate() - 30)
  const startDateISO = defaultStart.toISOString().slice(0,10)
  const endDateISO = defaultEnd.toISOString().slice(0,10)

  const load = useCallback((start = startDateISO, end = endDateISO) => {
    setLoading(true)
    getDespesas(start, end)
      .then(data => setDespesas(data || []))
      .catch(() => toast.error('Erro ao carregar despesas.'))
      .finally(() => setLoading(false))
  }, [startDateISO, endDateISO])

  useEffect(() => { load() }, [load])

  // Abrir o modal para Criação ou Edição
  const openModal = (d = null) => {
    if (d) {
      setEditDespesa(d)
      setEditDespesaForm({
        descricao: d.descricao || '',
        categoria: d.categoria || '',
        valor: d.valor != null ? String(d.valor) : '',
        dataDespesa: d.dataDespesa || ''
      })
    } else {
      setEditDespesa(null)
      setEditDespesaForm({ descricao: '', categoria: '', valor: '', dataDespesa: new Date().toISOString().slice(0,10) })
    }
    setIsModalOpen(true)
  }

  // Fechar Modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditDespesa(null)
  }

  // Salvar (Criar ou Atualizar)
  const handleSaveDespesa = async (e) => {
    e.preventDefault()
    if (!editDespesaForm.descricao?.trim() || !editDespesaForm.valor) return
    setEditDespesaSaving(true)

    const payload = {
      descricao: editDespesaForm.descricao.trim(),
      categoria: editDespesaForm.categoria?.trim() || null,
      valor: Number(editDespesaForm.valor),
      dataDespesa: editDespesaForm.dataDespesa || null
    }

    try {
      if (editDespesa) {
        await updateDespesa(editDespesa.id, payload)
        toast.success('Despesa atualizada!')
      } else {
        await createDespesa(payload)
        toast.success('Despesa registrada!')
      }
      closeModal()
      load()
    } catch { 
      toast.error('Erro ao salvar despesa.') 
    } finally { 
      setEditDespesaSaving(false) 
    }
  }

  // Fluxo de exclusão
  const handleDeleteDespesa = () => { if (editDespesa) setDeleteDespesaConfirm(true) }

  const confirmDeleteDespesa = async () => {
    setDeleteDespesaLoading(true)
    try {
      await deleteDespesa(editDespesa.id)
      toast.success('Despesa removida.')
      setDeleteDespesaConfirm(false)
      closeModal()
      load()
    } catch { 
      toast.error('Erro ao remover despesa.') 
    } finally { 
      setDeleteDespesaLoading(false) 
    }
  }

  const columns = [
    { header: 'Data', key: 'dataDespesa', render: d => <span>{formatDate(d.dataDespesa)}</span> },
    { header: 'Descrição', key: 'descricao', render: d => <span>{d.descricao}</span> },
    { header: 'Categoria', key: 'categoria', render: d => <span>{d.categoria || '-'}</span> },
    { header: 'Valor', key: 'valor', render: d => <strong>{formatCurrency(d.valor)}</strong> },
    {
      header: 'Ações',
      key: 'actions',
      render: (d) => (
        <button onClick={() => openModal(d)}
          style={{background:'var(--brand)',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:11,color:'#fff',fontWeight:700,whiteSpace:'nowrap'}}>
          Editar
        </button>
      )
    }
  ]

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='despesas' />
      <MainArea>
        <Topbar title='Despesas' />
        <ContentContainer>
          <PageHeader>
            <h2 style={{ margin: 0 }}>Histórico de Despesas</h2>
            <Button onClick={() => openModal(null)} full={false}>Nova Despesa</Button>
          </PageHeader>

          <DataTable
            data={currentItems}
            columns={columns}
            actions={null} // Limpado pois o botão foi pra coluna "Ações"
            toolbarActions={null}
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            loading={loading}
            emptyMessage='Nenhuma despesa registrada.'
          />
        </ContentContainer>
      </MainArea>

      {/* Modal Unificado (Nova e Editar Despesa) */}
      {isModalOpen && !deleteDespesaConfirm && (
        <EditModalOverlay onClick={closeModal}>
          <EditModal onClick={e => e.stopPropagation()}>
            <EMHead>
              <h2>{editDespesa ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button onClick={closeModal}><span className='material-symbols-outlined'>close</span></button>
            </EMHead>
            <form onSubmit={handleSaveDespesa}>
              <EMBody>
                <EMField>
                  <label>Descrição *</label>
                  <input autoFocus value={editDespesaForm.descricao || ''} onChange={e => setEditDespesaForm(f => ({...f, descricao: e.target.value}))} required />
                </EMField>
                <EMField>
                  <label>Categoria</label>
                  <input value={editDespesaForm.categoria || ''} onChange={e => setEditDespesaForm(f => ({...f, categoria: e.target.value}))} placeholder='Ex: Aluguel, Energia, Salários...' />
                </EMField>
                <EMField>
                  <label>Valor (R$) *</label>
                  <input type='number' step='0.01' min='0.01' value={editDespesaForm.valor || ''} onChange={e => setEditDespesaForm(f => ({...f, valor: e.target.value}))} required />
                </EMField>
                <EMField>
                  <label>Data da Despesa</label>
                  <input type='date' value={editDespesaForm.dataDespesa || ''} onChange={e => setEditDespesaForm(f => ({...f, dataDespesa: e.target.value}))} />
                </EMField>
              </EMBody>
              <EMActions>
                {editDespesa && (
                  <EMDelete type='button' onClick={handleDeleteDespesa} disabled={deleteDespesaLoading}>Apagar</EMDelete>
                )}
                <EMCancel type='button' onClick={closeModal}>Cancelar</EMCancel>
                <EMSave type='submit' disabled={editDespesaSaving || !editDespesaForm.descricao?.trim() || !editDespesaForm.valor}>
                  {editDespesaSaving ? 'Salvando...' : 'Salvar'}
                </EMSave>
              </EMActions>
            </form>
          </EditModal>
        </EditModalOverlay>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        open={deleteDespesaConfirm}
        title='Apagar despesa'
        message={`Tem certeza que deseja apagar a despesa "${editDespesa?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel='Apagar'
        onCancel={() => setDeleteDespesaConfirm(false)}
        onConfirm={confirmDeleteDespesa}
        loading={deleteDespesaLoading}
      />
    </Wrapper>
  )
}

export default DespesasView