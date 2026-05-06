import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from './Button'

const TableContainer = styled.div`
	background-color: #ffffff;
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	overflow: hidden;

	.table-toolbar {
		padding: 24px;
		border-bottom: 1px solid #eeeeee;
		background-color: #f3f3f3;
		display: flex;
		justify-content: space-between;
		align-items: center;
		span.result-count {
			font-size: 12px;
			font-weight: 700;
			color: #5a403c;
		}
		.toolbar-actions {
			display: flex;
			gap: 8px;
		}
	}

	table {
		width: 100%;
		text-align: left;
		border-collapse: collapse;
	}
	th {
		padding: 16px 24px;
		background-color: #f5f5f4;
		font-family: 'Epilogue', sans-serif;
		font-size: 10px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #5a403c;
	}
	td {
		padding: 16px 24px;
		border-bottom: 1px solid #eeeeee;
	}
	tr:hover {
		background-color: #f3f3f3;
	}

	.product-info {
		display: flex;
		align-items: center;
		gap: 12px;
		.product-icon {
			width: 40px;
			height: 40px;
			background: #ffdad6;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #610005;
		}
		h4 {
			font-family: 'Epilogue', sans-serif;
			font-weight: 700;
			font-size: 14px;
		}
		p {
			font-size: 10px;
			color: #78716c;
			text-transform: uppercase;
		}
	}
	.text-highlight {
		font-size: 12px;
		font-weight: 600;
		color: #1a1c1c;
	}
	.category-badge {
		background-color: #dfe0ff;
		color: #0d2ccc;
		padding: 4px 12px;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.stock-indicator {
		text-align: right;
		p {
			font-family: 'Epilogue', sans-serif;
			font-weight: 700;
			font-size: 14px;
		}
		.progress-track {
			width: 100%;
			height: 4px;
			background-color: #e7e5e4;
			border-radius: 2px;
			margin-top: 4px;
			overflow: hidden;
		}
		.progress-fill {
			height: 100%;
			transition: width 0.3s;
		}
	}

	.row-actions button {
		background: none;
		border: none;
		color: #a8a29e;
		padding: 8px;
		cursor: pointer;
		transition: color 0.2s;
		&:hover {
			color: #610005;
		}
	}

	.pagination {
		padding: 16px 24px;
		background-color: #f5f5f4;
		border-top: 1px solid #eeeeee;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.page-info {
			font-size: 12px;
			font-weight: 700;
			color: #5a403c;
		}
		.page-controls {
			display: flex;
			gap: 4px;
			button {
				width: 32px;
				height: 32px;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1px solid #e7e5e4;
				background: white;
				color: #78716c;
				cursor: pointer;
				&:hover {
					background: #f3f3f3;
				}
				&.active {
					background: #610005;
					color: white;
					border-color: #610005;
				}
				&:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
			}
		}
	}
`

const DataTable = ({
	data,
	columns,
	actions,
	toolbarActions,
	currentPage,
	totalPages,
	totalItems,
	onPageChange,
	loading,
	emptyMessage = 'Nenhum item encontrado.',
}) => {
	const itemsPerPage = 10
	const startItem = (currentPage - 1) * itemsPerPage + 1
	const endItem = Math.min(currentPage * itemsPerPage, totalItems)

	return (
		<TableContainer>
			<div className='table-toolbar'>
				<span className='result-count'>{totalItems} Itens encontrados</span>
				<div className='toolbar-actions'>{toolbarActions}</div>
			</div>

			<table>
				<thead>
					<tr>
						{columns.map((col, index) => (
							<th key={index} style={col.style}>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td
								colSpan={columns.length}
								style={{
									textAlign: 'center',
									padding: '32px',
									color: '#a8a29e',
								}}
							>
								Carregando dados...
							</td>
						</tr>
					) : data.length > 0 ? (
						data.map((item, index) => (
							<tr key={item.id || index}>
								{columns.map((col, colIndex) => (
									<td key={colIndex} style={col.style}>
										{col.render ? col.render(item) : item[col.key]}
									</td>
								))}
								{actions && (
									<td className='row-actions'>
										{actions.map((action, actionIndex) => (
											<button
												key={actionIndex}
												onClick={() => action.onClick(item)}
											>
												<span className='material-symbols-outlined'>
													{action.icon}
												</span>
											</button>
										))}
									</td>
								)}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columns.length + (actions ? 1 : 0)}
								style={{
									textAlign: 'center',
									padding: '32px',
									color: '#a8a29e',
								}}
							>
								{emptyMessage}
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{totalPages > 1 && (
				<div className='pagination'>
					<span className='page-info'>
						Exibindo {startItem} de {endItem} de {totalItems} itens
					</span>
					<div className='page-controls'>
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<span className='material-symbols-outlined'>chevron_left</span>
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								className={page === currentPage ? 'active' : ''}
								onClick={() => onPageChange(page)}
							>
								{page}
							</button>
						))}
						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							<span className='material-symbols-outlined'>chevron_right</span>
						</button>
					</div>
				</div>
			)}
		</TableContainer>
	)
}

export default DataTable
