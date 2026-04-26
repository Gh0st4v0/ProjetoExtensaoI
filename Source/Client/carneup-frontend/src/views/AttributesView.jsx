import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import QuickCreateModal from '../components/QuickCreateModal'

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
  const [brands, setBrands] = useState(['Heritage Farms','PrimeCuts','Local Ranch'])
  const [categories, setCategories] = useState(['Bovine','Porcine','Poultry','Lamb','Processed'])
  const [quickOpen, setQuickOpen] = useState({ open:false, type:null })
  const [editing, setEditing] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // mock product links to test deletion denial (product.brand or product.category)
  const products = useMemo(() => [
    { id:1, name:'T-Bone', brand:'Heritage Farms', category:'Bovine' },
    { id:2, name:'Pork Chop', brand:'PrimeCuts', category:'Porcine' }
  ], [])

  const brandRows = brands.map((b, i) => ({ id: `brand-${i}`, name: b }))
  const categoryRows = categories.map((c, i) => ({ id: `cat-${i}`, name: c }))

  const handleCreate = (type, value) => {
    if (type === 'brand') setBrands(prev => [...prev, value])
    if (type === 'category') setCategories(prev => [...prev, value])
  }

  const handleDelete = (type, name) => {
    // deny if linked to product
    const linked = products.find(p => (type === 'brand' && p.brand === name) || (type === 'category' && p.category === name))
    if (linked) {
      setErrorMsg(`Não é possível excluir "${name}" pois existem produtos vinculados.`)
      setTimeout(() => setErrorMsg(''), 4500)
      return
    }
    if (type === 'brand') setBrands(prev => prev.filter(b => b !== name))
    if (type === 'category') setCategories(prev => prev.filter(c => c !== name))
  }

  const handleEdit = (type, oldName, newName) => {
    if (!newName || newName.trim().length < 2) return
    if (type === 'brand') setBrands(prev => prev.map(b => b === oldName ? newName : b))
    if (type === 'category') setCategories(prev => prev.map(c => c === oldName ? newName : c))
    setEditing(null)
  }

  const brandColumns = [
    { key: 'name', header: 'Marca' }
  ]
  const categoryColumns = [
    { key: 'name', header: 'Categoria' }
  ]

  const rowActions = (type) => ([
    { icon: 'edit', onClick: (row) => setEditing({ type, oldName: row.name }) },
    { icon: 'delete', onClick: (row) => handleDelete(type, row.name) }
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
            <QuickCreateModal open={true} type={editing.type} onClose={() => setEditing(null)} onCreate={(val) => handleEdit(editing.type, editing.oldName, val)} />
          )}

          {quickOpen.open && (
            <QuickCreateModal open={quickOpen.open} type={quickOpen.type} onClose={() => setQuickOpen({ open:false, type:null })} onCreate={(val) => handleCreate(quickOpen.type, val)} />
          )}

        </Container>
      </Main>
    </Page>
  )
}
