import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import DiscardModal from '../components/DiscardModal'
import ConfirmModal from '../components/ConfirmModal'
import { getDiscards, createDiscard, updateDiscard, deleteDiscard } from '../services/discardApi'
import { usePagination } from '../services/usePagination'
import { toast } from 'react-toastify'

// ── Styles ──────────────────────────────────────────────────────────────────
const Wrapper = styled.div`display: flex; min-height: 100vh; background: var(--bg, #f9f9f9);`
const MainArea = styled.main`flex: 1; display: flex; flex-direction: column;`
const ContentContainer = styled.div`padding: 32px; max-width: 1280px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px;`
const PageHeader = styled.div`display: flex; justify-content: space-between; align-items: center;`

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

const TYPE_LABELS = { VENCIMENTO:'Vencimento', DANO:'Dano / Avaria', ROUBO:'Roubo', PERDA_PESO:'Perda de Peso', CONSUMO_PESSOAL:'Consumo Pessoal', OUTRO:'Outro' }
const MOTIVO_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))

export const DiscardView = ({ navigate }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [discards, setDiscards] = useState([])
  const [loading, setLoading] = useState(true)
  const { page, setPage, totalPages, totalItems, currentItems } = usePagination(discards)

  // Estados de edição (estilo ReportsView)
  const [editDescarte, setEditDescarte] = useState(null)
  const [editDescarteForm, setEditDescarteForm] = useState({})
  const [editDescarteSaving, setEditDescarteSaving] = useState(false)
  
  // Estados de exclusão
  const [deleteDescarteConfirm, setDeleteDescarteConfirm] = useState(false)
  const [deleteDescarteLoading, setDeleteDescarteLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getDiscards()
      .then(data => setDiscards(data))
      .catch(() => toast.error('Erro ao carregar descartes.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Submeter novo descarte (via modal original)
  const handleCreateSubmit = async (payload) => {
    await createDiscard(payload)
    toast.success('Descarte registrado com sucesso!')
    setCreateModalOpen(false)
    load()
  }

  // Abrir Modal de Edição
  const openEditDescarte = (d) => {
    setEditDescarte(d)
    setEditDescarteForm({ date: d.date || '', type: d.type || '' })
  }

  // Salvar Edição
  const handleSaveDescarte = async (e) => {
    e.preventDefault()
    if (!editDescarteForm.type) return
    setEditDescarteSaving(true)
    try {
      await updateDiscard(editDescarte.id, {
        date: editDescarteForm.date || null,
        type: editDescarteForm.type
      })
      toast.success('Descarte atualizado!')
      setEditDescarte(null)
      load()
    } catch { 
      toast.error('Erro ao atualizar descarte.') 
    } finally { 
      setEditDescarteSaving(false) 
    }
  }

  // Fluxo de exclusão
  const handleDeleteDescarte = () => { if (editDescarte) setDeleteDescarteConfirm(true) }
  
  const confirmDeleteDescarte = async () => {
    setDeleteDescarteLoading(true)
    try {
      await deleteDiscard(editDescarte.id)
      toast.success('Descarte removido e estoque restaurado.')
      setDeleteDescarteConfirm(false)
      setEditDescarte(null)
      load()
    } catch { 
      toast.error('Erro ao remover descarte.') 
    } finally { 
      setDeleteDescarteLoading(false) 
    }
  }

  const columns = [
    { header: 'Data', key: 'date', render: (d) => <span>{d.date}</span> },
    {
      header: 'Produto(s)',
      key: 'items',
      render: (d) => (
        <div>
          {(d.items || []).map((item, i) => (
            <div key={i}><strong>{item.productName}</strong> — {item.quantity} {item.unitMeasurement}</div>
          ))}
        </div>
      )
    },
    { header: 'Motivo', key: 'type', render: (d) => <span>{TYPE_LABELS[d.type] || d.type}</span> },
    {
      header: 'Ações',
      key: 'actions',
      render: (d) => (
        <button onClick={() => openEditDescarte(d)}
          style={{background:'var(--brand)',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:11,color:'#fff',fontWeight:700,whiteSpace:'nowrap'}}>
          Editar
        </button>
      )
    }
  ]

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='discard' />
      <MainArea>
        <Topbar title='Histórico de Descartes' />
        <ContentContainer>
          <PageHeader>
            <Button full={false} small onClick={() => setCreateModalOpen(true)}>
              Novo Descarte
            </Button>
          </PageHeader>

          <DataTable
            data={currentItems}
            columns={columns}
            actions={null} // Limpamos aqui pois o botão foi adicionado na coluna "Ações" acima
            toolbarActions={null}
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            loading={loading}
            emptyMessage='Nenhum descarte registrado.'
          />
        </ContentContainer>
      </MainArea>

      {/* Modal Original para Novo Descarte */}
      <DiscardModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Modal de Edição Estilizado (ReportsView) */}
      {editDescarte && !deleteDescarteConfirm && (
        <EditModalOverlay onClick={() => setEditDescarte(null)}>
          <EditModal onClick={e => e.stopPropagation()}>
            <EMHead>
              <h2>Editar Descarte #{editDescarte.id}</h2>
              <button onClick={() => setEditDescarte(null)}><span className='material-symbols-outlined'>close</span></button>
            </EMHead>
            <form onSubmit={handleSaveDescarte}>
              <EMBody>
                <EMField>
                  <label>Motivo *</label>
                  <select
                    value={editDescarteForm.type || ''}
                    onChange={e => setEditDescarteForm(f => ({...f, type: e.target.value}))}
                    required
                  >
                    <option value=''>Selecionar motivo...</option>
                    {MOTIVO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </EMField>
                <EMField>
                  <label>Data do Descarte</label>
                  <input type='date' value={editDescarteForm.date || ''} onChange={e => setEditDescarteForm(f => ({...f, date: e.target.value}))} />
                  <small>Apenas o motivo e a data podem ser corrigidos. Os itens descartados não são alterados.</small>
                </EMField>
              </EMBody>
              <EMActions>
                {/* Validação: Só exibe o botão se o motivo NÃO for vencimento */}
                {editDescarteForm.type !== 'VENCIMENTO' && (
                  <EMDelete type='button' onClick={handleDeleteDescarte} disabled={deleteDescarteLoading}>
                    Apagar
                  </EMDelete>
                )}
                
                <EMCancel type='button' onClick={() => setEditDescarte(null)}>Cancelar</EMCancel>
                
                <EMSave type='submit' disabled={editDescarteSaving || !editDescarteForm.type}>
                  {editDescarteSaving ? 'Salvando...' : 'Salvar'}
                </EMSave>
              </EMActions>
            </form>
          </EditModal>
        </EditModalOverlay>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        open={deleteDescarteConfirm}
        title='Apagar descarte'
        message={`Tem certeza que deseja apagar o Descarte #${editDescarte?.id}? Os itens descartados serão devolvidos ao estoque. Esta ação não pode ser desfeita.`}
        confirmLabel='Apagar e restaurar estoque'
        onCancel={() => setDeleteDescarteConfirm(false)}
        onConfirm={confirmDeleteDescarte}
        loading={deleteDescarteLoading}
      />
    </Wrapper>
  )
}

export default DiscardView