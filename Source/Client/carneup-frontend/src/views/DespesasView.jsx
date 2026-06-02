import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import DespesaModal from '../components/DespesaModal'
import { getDespesas, createDespesa, deleteDespesa } from '../services/despesasApi'
import { usePagination } from '../services/usePagination'
import { toast } from 'react-toastify'

const Wrapper = styled.div`display:flex; min-height:100vh; background:var(--bg);`
const MainArea = styled.main`flex:1; display:flex; flex-direction:column;`
const ContentContainer = styled.div`padding:32px; max-width:1280px; margin:0 auto; width:100%; display:flex; flex-direction:column; gap:24px;`
const PageHeader = styled.div`display:flex; justify-content:space-between; align-items:center;`

const formatCurrency = (v) => v == null ? '' : `R$ ${Number(v).toFixed(2)}`
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : ''

export const DespesasView = ({ navigate }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [despesas, setDespesas] = useState([])
  const [loading, setLoading] = useState(true)
  const { page, setPage, totalPages, totalItems, currentItems } = usePagination(despesas)

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

  const handleSubmit = async (payload) => {
    await createDespesa(payload)
    toast.success('Despesa registrada com sucesso!')
    load()
  }

  const handleDelete = async (id) => {
    try {
      await deleteDespesa(id)
      toast.success('Despesa removida')
      load()
    } catch (err) {
      toast.error('Erro ao excluir despesa')
    }
  }

  const columns = [
    { header: 'Data', key: 'dataDespesa', render: d => <span>{formatDate(d.dataDespesa)}</span> },
    { header: 'Descrição', key: 'descricao', render: d => <span>{d.descricao}</span> },
    { header: 'Categoria', key: 'categoria', render: d => <span>{d.categoria || '-'}</span> },
    { header: 'Valor', key: 'valor', render: d => <strong>{formatCurrency(d.valor)}</strong> },
  ]

  return (
    <Wrapper>
      <Sidebar navigate={navigate} activeView='despesas' />
      <MainArea>
        <Topbar title='Despesas' />
        <ContentContainer>
          <PageHeader>
            <h2 style={{ margin: 0 }}>Histórico de Despesas</h2>
            <Button onClick={() => setModalOpen(true)} full={false}>Nova Despesa</Button>
          </PageHeader>

          <DataTable
            data={currentItems}
            columns={columns}
            actions={[{ label: 'Excluir', onClick: (d) => handleDelete(d.id) }]}
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

      <DespesaModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </Wrapper>
  )
}

export default DespesasView
