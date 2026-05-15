import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import DiscardModal from '../components/DiscardModal'
import { getDiscards, createDiscard } from '../services/discardApi'
import { usePagination } from '../services/usePagination'
import { toast } from 'react-toastify'

const Wrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #f9f9f9;
`
const MainArea = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
`
const ContentContainer = styled.div`
	padding: 32px;
	max-width: 1280px;
	margin: 0 auto;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 24px;
`
const PageHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const TYPE_LABELS = {
	VENCIMENTO: 'Vencimento',
	DANO: 'Dano / Avaria',
	ROUBO: 'Roubo',
	PERDA_PESO: 'Perda de Peso',
	CONSUMO_PESSOAL: 'Consumo Pessoal',
	OUTRO: 'Outro',
}

export const DiscardView = ({ navigate }) => {
	const [modalOpen, setModalOpen] = useState(false)
	const [discards, setDiscards] = useState([])
	const [loading, setLoading] = useState(true)
	const { page, setPage, totalPages, totalItems, currentItems } = usePagination(discards)

	const load = useCallback(() => {
		setLoading(true)
		getDiscards()
			.then(data => setDiscards(data))
			.catch(() => toast.error('Erro ao carregar descartes.'))
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { load() }, [load])

	const handleSubmit = async (payload) => {
		await createDiscard(payload)
		toast.success('Descarte registrado com sucesso!')
		load()
	}

	const columns = [
		{
			header: 'Data',
			key: 'date',
			render: (d) => <span>{d.date}</span>,
		},
		{
			header: 'Produto(s)',
			key: 'items',
			render: (d) => (
				<div>
					{(d.items || []).map((item, i) => (
						<div key={i}><strong>{item.productName}</strong> — {item.quantity} {item.unitMeasurement}</div>
					))}
				</div>
			),
		},
		{
			header: 'Motivo',
			key: 'type',
			render: (d) => <span>{TYPE_LABELS[d.type] || d.type}</span>,
		},
	]

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='discard' />
			<MainArea>
				<Topbar title='Histórico de Descartes' />
				<ContentContainer>
					<PageHeader>
						<Button full={false} small onClick={() => setModalOpen(true)}>
							Novo Descarte
						</Button>
					</PageHeader>

					<DataTable
						data={currentItems}
						columns={columns}
						actions={[]}
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

			<DiscardModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onSubmit={handleSubmit}
			/>
		</Wrapper>
	)
}

export default DiscardView
