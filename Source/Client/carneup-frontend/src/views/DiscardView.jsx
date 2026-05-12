import React, { useState } from 'react'
import styled from 'styled-components'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import DataTable from '../components/DataTable'
import { Button } from '../components/Button'
import DiscardModal from '../components/DiscardModal'

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

const PageTitle = styled.h2`
	font-family: 'Epilogue', sans-serif;
	font-size: 28px;
	font-weight: 900;
	color: #610005;
	text-transform: uppercase;
	margin: 0;
`

const PageSubtitle = styled.p`
	color: #5a403c;
	font-size: 14px;
	margin: 4px 0 0;
`

export const DiscardView = ({ navigate }) => {
	const [modalOpen, setModalOpen] = useState(false)
	const [discards, setDiscards] = useState([
		{
			id: 1,
			date: '2026-04-20',
			product: 'Picanha Maturatta',
			qty: 2.5,
			unit: 'Kg',
			reason: 'Contaminação',
		},
		{
			id: 2,
			date: '2026-04-22',
			product: 'Linguiça Toscana',
			qty: 3,
			unit: 'Un',
			reason: 'Vencimento',
		},
	])

	// mock product list for modal select
	const products = [
		{ id: 1, name: 'Picanha Maturatta', code: '#001' },
		{ id: 2, name: 'Linguiça Toscana', code: '#031' },
		{ id: 3, name: 'Ribeye Premium', code: '#002' },
	]

	const handleAdd = (entry) => {
		const prod = products.find((p) => String(p.id) === String(entry.productId))
		const newEntry = {
			id: entry.id || Date.now(),
			date: entry.date || new Date().toISOString().slice(0, 10),
			product: prod ? prod.name : entry.productId,
			qty: parseFloat(entry.qty) || 0,
			unit: entry.unit || 'Kg',
			reason: entry.reason || '',
		}
		setDiscards((prev) => [newEntry, ...prev])
	}

	const columns = [
		{ header: 'Data', key: 'date', render: (d) => <span>{d.date}</span> },
		{
			header: 'Produto',
			key: 'product',
			render: (d) => <strong>{d.product}</strong>,
		},
		{
			header: 'Quantidade',
			key: 'qty',
			style: { textAlign: 'right' },
			render: (d) => (
				<span>
					{d.qty} {d.unit}
				</span>
			),
		},
		{ header: 'Motivo', key: 'reason', render: (d) => <span>{d.reason}</span> },
	]

	const actions = [
		{
			icon: 'delete',
			onClick: (item) =>
				setDiscards((prev) => prev.filter((p) => p.id !== item.id)),
		},
	]

	return (
		<Wrapper>
			<Sidebar navigate={navigate} activeView='discard' />
			<MainArea>
				<Topbar title='Descartes' />
				<ContentContainer>
					<PageHeader>
						<div>
							<PageTitle>
								Histórico de Descartes
							</PageTitle>
							<PageSubtitle>
								Registre perdas e visualize descartes realizados.
							</PageSubtitle>
						</div>
						<div>
							<Button full={false} small onClick={() => setModalOpen(true)}>
								Novo Descarte
							</Button>
						</div>
					</PageHeader>

					<DataTable
						data={discards}
						columns={columns}
						actions={actions}
						toolbarActions={null}
						currentPage={1}
						totalPages={1}
						totalItems={discards.length}
						onPageChange={() => {}}
						loading={false}
						emptyMessage='No discard records.'
					/>
				</ContentContainer>
			</MainArea>

			<DiscardModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onSubmit={handleAdd}
				products={products}
			/>
		</Wrapper>
	)
}

export default DiscardView
