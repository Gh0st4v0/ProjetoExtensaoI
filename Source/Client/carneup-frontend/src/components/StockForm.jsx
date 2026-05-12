import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { Input } from './Input'
import NumberField, { parseLocaleNumber } from './NumberField'

const FormContainer = styled.div`
	background-color: #f5f5f4;
	padding: 32px;
	border-radius: 4px;
	position: relative;
	overflow: hidden;

	.decorative-bg {
		position: absolute;
		top: -40px;
		right: -40px;
		opacity: 0.05;
		pointer-events: none;
		font-size: 12rem;
		color: #ba1a1a;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
		position: relative;
		z-index: 10;
		h3 {
			font-family: 'Epilogue', sans-serif;
			font-size: 20px;
			font-weight: 900;
			color: #ba1a1a;
			text-transform: uppercase;
			letter-spacing: -0.025em;
		}
		.icon {
			color: #ba1a1a;
		}
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 24px;
		position: relative;
		z-index: 10;

		.form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}
	}

	.margin-card {
		background-color: #ba1a1a;
		color: #ffffff;
		padding: 16px;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 24px;
		.margin-info {
			p {
				font-size: 10px;
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.1em;
				opacity: 0.8;
				margin-bottom: 4px;
			}
			h4 {
				font-family: 'Epilogue', sans-serif;
				font-size: 20px;
				font-weight: 900;
			}
		}
		.icon {
			font-size: 2.5rem;
			opacity: 0.2;
		}
	}
`

export const StockForm = ({ products, onSubmit }) => {
	const [formData, setFormData] = useState({
		productId: '',
		quantity: '',
		expiryDate: '',
		costPrice: '',
		salePrice: ''
	})

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSubmit(formData)
	}

	const calculateMargin = () => {
		const cost = parseLocaleNumber(formData.costPrice) || 0
		const sale = parseLocaleNumber(formData.salePrice) || 0
		if (cost > 0 && sale > 0) {
			const margin = ((sale - cost) / cost) * 100
			return margin.toFixed(1) + '%'
		}
		return '--%'
	}

	return (
		<FormContainer>
			<div className='decorative-bg'>
				<span className='material-symbols-outlined'>restaurant</span>
			</div>

			<div className='form-header'>
				<span className='material-symbols-outlined icon'>inventory</span>
				<h3>Entrada de Estoque</h3>
			</div>

			<form onSubmit={handleSubmit}>
				<div>
					<label style={{
						fontSize: '10px',
						fontWeight: '700',
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
						color: '#5a403c',
						marginBottom: '8px',
						display: 'block'
					}}>
						Selecionar Produto
					</label>
					<select
						name='productId'
						value={formData.productId}
						onChange={handleChange}
						style={{
							width: '100%',
							padding: '12px',
							border: '1px solid #e7e5e4',
							borderRadius: '4px',
							fontFamily: 'Work Sans, sans-serif',
							fontSize: '14px',
							backgroundColor: '#ffffff'
						}}
						required
					>
						<option value=''>Selecionar um produto...</option>
						{products.map(product => (
							<option key={product.id} value={product.id}>
								{product.name} ({product.code})
							</option>
						))}
					</select>
				</div>

				<div className='form-grid'>
					<NumberField
						label='Quantidade/Peso'
						name='quantity'
						value={formData.quantity}
						onChange={handleChange}
						placeholder='0,000'
						decimals={3}
						required
					/>

					<Input
						label='Data de Validade'
						name='expiryDate'
						type='date'
						value={formData.expiryDate}
						onChange={handleChange}
						required
					/>

					<NumberField
						label='Preço de Custo'
						name='costPrice'
						value={formData.costPrice}
						onChange={handleChange}
						prefix='R$'
						placeholder='0,00'
						decimals={2}
						currencyMask
						required
					/>

					<NumberField
						label='Preço de Venda'
						name='salePrice'
						value={formData.salePrice}
						onChange={handleChange}
						prefix='R$'
						placeholder='0,00'
						decimals={2}
						currencyMask
						required
					/>
				</div>

				<div className='margin-card'>
					<div className='margin-info'>
						<p>Margem Projetada</p>
						<h4>{calculateMargin()}</h4>
					</div>
					<span className='material-symbols-outlined icon'>trending_up</span>
				</div>

				<Button type='submit' variant='secondary' style={{ width: '100%', marginTop: '24px' }}>
					<span className='material-symbols-outlined' style={{ marginRight: '8px' }}>save</span>
					Atualizar Níveis de Estoque
				</Button>
			</form>
		</FormContainer>
	)
}
