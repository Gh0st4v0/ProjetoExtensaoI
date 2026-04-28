import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import QuickCreateModal from '../components/QuickCreateModal'
import { useAttributes } from '../context/AttributesContext'

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

  const handleCreate = async (type, value) => {
    try {
      if (type === 'brand') await addBrand(value)
      if (type === 'category') await addCategory(value)
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Falha ao criar')
      setTimeout(() => setErrorMsg(''), 4500)
    }
  }

  const handleDelete = async (type, id, name) => {
    try {
      const linked = products.find(p => (type === 'brand' && p.brand === name) || (type === 'category' && p.category === name))
      if (linked) {
        setErrorMsg(`Não é possível excluir "${name}" pois existem produtos vinculados.`)
        setTimeout(() => setErrorMsg(''), 4500)
        return
      }

      if (type === 'brand') await removeBrand(id)
      if (type === 'category') await removeCategory(id)
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Falha ao excluir')
      setTimeout(() => setErrorMsg(''), 4500)
    }
  }

  const handleEdit = async (type, id, newName) => {
    if (!newName || newName.trim().length < 2) return
    try {
      if (type === 'brand') await updateBrand(id, newName)
      if (type === 'category') await updateCategory(id, newName)
      setEditing(null)
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Falha ao editar')
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
              <DataTable data={brandRows} columns={brandColumns} actions={rowActions('brand')} toolbarActions={null} currentPage={1} totalPages={1} totalItems={brandRows.length} onPageChange={()=>{}} loading={false} emptyMessage='Nenhuma marca cadastrada.' />
            </div>

            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h4 style={{margin:0}}>Categorias</h4>
                <div>
                  <Button full={false} small onClick={() => setQuickOpen({ open:true, type:'category'})}>Nova Categoria</Button>
                </div>
              </div>
              <DataTable data={categoryRows} columns={categoryColumns} actions={rowActions('category')} toolbarActions={null} currentPage={1} totalPages={1} totalItems={categoryRows.length} onPageChange={()=>{}} loading={false} emptyMessage='Nenhuma categoria cadastrada.' />
            </div>
          </div>

          {editing && (
            <QuickCreateModal open={true} type={editing.type} onClose={() => setEditing(null)} onCreate={(val) => handleEdit(editing.type, editing.id, val)} initialValue={editing.oldName} />
          )}

          {quickOpen.open && (
            <QuickCreateModal open={quickOpen.open} type={quickOpen.type} onClose={() => setQuickOpen({ open:false, type:null })} onCreate={(val) => handleCreate(quickOpen.type, val)} />
          )}

        </Container>
      </Main>
    </Page>
  )
}
