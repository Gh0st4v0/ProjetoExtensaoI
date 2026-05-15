import React, { useState, useMemo } from 'react'
import { toTitleCase } from '../services/textUtils'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import QuickCreateModal from '../components/QuickCreateModal'
import ConfirmModal from '../components/ConfirmModal'
import { useAttributes } from '../context/AttributesContext'
import { usePagination } from '../services/usePagination'

const Page = styled.div`
  display:flex;
  height:100vh;
`
const Main = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
`
const Container = styled.div`
  padding:24px;
  overflow:auto;
`
export default function AttributesView({ navigate }) {
  const { brands, categories, addBrand, addCategory, updateBrand, updateCategory, removeBrand, removeCategory } = useAttributes()
  const [quickOpen, setQuickOpen] = useState({ open:false, type:null })
  const [editing, setEditing] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // mock product links to test deletion denial (product.brand or product.category)
  const products = useMemo(() => [
    { id:1, name:'T-Bone', brand:'Heritage Farms', category:'Bovine' },
    { id:2, name:'Pork Chop', brand:'PrimeCuts', category:'Porcine' }
  ], [])

  const brandRows = (brands || []).map((b) => ({ id: `brand-${b.id}`, name: b.brandName, refId: b.id }))
  const categoryRows = (categories || []).map((c) => ({ id: `cat-${c.id}`, name: c.categoryName, refId: c.id }))

  const brandPag = usePagination(brandRows)
  const catPag   = usePagination(categoryRows)

  const translateByStatus = (err) => {
    const status = err?.response?.status;
    if (status === 404) return 'Recurso não encontrado.';
    if (status === 409) return 'Conflito: recurso já existe.';
    if (status === 422) return 'Operação não permitida.';
    return 'Falha ao processar a solicitação. Tente novamente.';
  }

  const handleCreate = async (type, value) => {
    try {
      const formatted = toTitleCase(value)
      if (type === 'brand') await addBrand(formatted)
      if (type === 'category') await addCategory(formatted)
      // close quick create modal after successful creation
      setQuickOpen({ open:false, type:null })
    } catch (e) {
      const msg = e?.response?.status ? translateByStatus(e) : 'Falha ao criar';
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(''), 4500)
    }
  }

  const [deleteConfirm, setDeleteConfirm] = useState({ open:false, type:null, id:null, name:null, linked:false, error:null, loading:false, message:null })

  const handleDelete = (type, id, name) => {
    const linked = products.find(p => (type === 'brand' && p.brand === name) || (type === 'category' && p.category === name))
    setDeleteConfirm({ open:true, type, id, name, linked: !!linked, error:null, loading:false, message: !!linked ? `Não é possível excluir "${name}" pois existem produtos vinculados.` : null })
  }

  const confirmDelete = async () => {
    const { type, id, linked, name } = deleteConfirm
    try {
      setDeleteConfirm(prev => ({ ...prev, loading:true, error:null }))
      if (linked) {
        // cannot delete, just close the modal
        setDeleteConfirm({ open:false, type:null, id:null, name:null, linked:false, error:null, loading:false, message:null })
        return
      }
      if (type === 'brand') await removeBrand(id)
      if (type === 'category') await removeCategory(id)
      setDeleteConfirm({ open:false, type:null, id:null, name:null, linked:false, error:null, loading:false, message:null })
    } catch (e) {
      const status = e?.response?.status;
      if (status === 422) {
        // show localized modal message instead of backend text
        setDeleteConfirm({ open:true, type, id, name, linked:true, error:null, loading:false, message: `Não é possível excluir "${name}" pois existem produtos vinculados.` });
      } else {
        const msg = status ? translateByStatus(e) : 'Falha ao excluir';
        setDeleteConfirm(prev => ({ ...prev, loading:false, error: msg }));
      }
    }
  }

  const handleEdit = async (type, id, newName) => {
    if (!newName || newName.trim().length < 2) return
    try {
      if (type === 'brand') await updateBrand(id, newName)
      if (type === 'category') await updateCategory(id, newName)
      setEditing(null)
    } catch (e) {
      const msg = e?.response?.status ? translateByStatus(e) : 'Falha ao editar';
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(''), 4500)
    }
  }

  const brandColumns = [
    { key: 'name', header: 'Marca' }
  ]
  const categoryColumns = [
    { key: 'name', header: 'Categoria' }
  ]

  const rowActions = (type) => ([
    { icon: 'edit', onClick: (row) => setEditing({ type, id: row.refId, oldName: row.name }) },
    { icon: 'delete', onClick: (row) => handleDelete(type, row.refId, row.name) }
  ])

  return (
    <Page>
      <Sidebar navigate={navigate} activeView='attributes' />
      <Main>
        <Topbar title='Gerenciamento de Atributos' />
        <Container>
          {errorMsg && <div style={{background:'#fee',border:'1px solid #f3c6c6',padding:12,borderRadius:6,color:'#8a1f1f',marginBottom:12}}>{errorMsg}</div>}

          <div style={{display:'flex',gap:24}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h4 style={{margin:0}}>Marcas</h4>
                <div>
                  <Button full={false} small onClick={() => setQuickOpen({ open:true, type:'brand'})}>Nova Marca</Button>
                </div>
              </div>
              <DataTable data={brandPag.currentItems} columns={brandColumns} actions={rowActions('brand')} toolbarActions={null} currentPage={brandPag.page} totalPages={brandPag.totalPages} totalItems={brandPag.totalItems} onPageChange={brandPag.setPage} loading={false} emptyMessage='Nenhuma marca cadastrada.' />
            </div>

            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h4 style={{margin:0}}>Categorias</h4>
                <div>
                  <Button full={false} small onClick={() => setQuickOpen({ open:true, type:'category'})}>Nova Categoria</Button>
                </div>
              </div>
              <DataTable data={catPag.currentItems} columns={categoryColumns} actions={rowActions('category')} toolbarActions={null} currentPage={catPag.page} totalPages={catPag.totalPages} totalItems={catPag.totalItems} onPageChange={catPag.setPage} loading={false} emptyMessage='Nenhuma categoria cadastrada.' />
            </div>
          </div>

          {editing && (
            <QuickCreateModal open={true} type={editing.type} onClose={() => setEditing(null)} onCreate={(val) => handleEdit(editing.type, editing.id, val)} initialValue={editing.oldName} />
          )}

          {quickOpen.open && (
            <QuickCreateModal open={quickOpen.open} type={quickOpen.type} onClose={() => setQuickOpen({ open:false, type:null })} onCreate={(val) => handleCreate(quickOpen.type, val)} />
          )}

          {deleteConfirm.open && (
            <ConfirmModal
              open={deleteConfirm.open}
              title={deleteConfirm.linked ? 'Impossível excluir' : `Excluir ${deleteConfirm.name}`}
              message={deleteConfirm.message ?? (deleteConfirm.linked ? `Não é possível excluir "${deleteConfirm.name}" pois existem produtos vinculados.` : `Tem certeza que deseja excluir "${deleteConfirm.name}"?`)}
              confirmLabel={deleteConfirm.linked ? 'Fechar' : 'Excluir'}
              onCancel={() => setDeleteConfirm({ open:false, type:null, id:null, name:null, linked:false, error:null, loading:false, message:null })}
              onConfirm={confirmDelete}
              loading={deleteConfirm.loading}
              error={deleteConfirm.error}
            />
          )}

        </Container>
      </Main>
    </Page>
  )
}
