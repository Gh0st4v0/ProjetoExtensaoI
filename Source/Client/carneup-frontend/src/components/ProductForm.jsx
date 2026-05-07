import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from './Button'
import { Input } from './Input'
import QuickCreateModal from './QuickCreateModal'

const FormContainer = styled.div`
	background-color: #ffffff;
	padding: 32px;
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	border-top: 4px solid #610005;

	.form-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
		h3 {
			font-family: 'Epilogue', sans-serif;
			font-size: 20px;
			font-weight: 900;
			color: #610005;
			text-transform: uppercase;
			letter-spacing: -0.025em;
		}
		.icon {
			color: #610005;
		}
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 24px;

		.form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 24px;

			.full-width {
				grid-column: 1 / -1;
			}
		}

		.radio-group {
			display: flex;
			gap: 16px;
			label {
				display: flex;
				align-items: center;
				gap: 8px;
				cursor: pointer;
				font-size: 14px;
				font-weight: 600;
				color: #5a403c;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
		}
	}
`

export const ProductForm = ({ onSubmit, brands: propBrands = [], categories: propCategories = [], onQuickCreate }) => {
	const [formData, setFormData] = useState({
		name: '',
		code: '',
		brand: '',
		category: '',
		unit: 'KG',
		price: ''
	})

	const [localBrands, setLocalBrands] = useState([])
	const [localCategories, setLocalCategories] = useState([])
	const brandsList = propBrands && propBrands.length ? propBrands : (localBrands.length ? localBrands : ['Heritage Farms','PrimeCuts','Local Ranch'])
	const categoriesList = propCategories && propCategories.length ? propCategories : (localCategories.length ? localCategories : ['Bovine','Porcine','Poultry','Lamb','Processed'])

	const [quickOpen, setQuickOpen] = useState({ open: false, type: null })
	const [errors, setErrors] = useState({})

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
		setErrors(prev => ({ ...prev, [name]: null }))
	}

	const validate = () => {
		const newErrors = {}
		if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Nome é obrigatório.'
		if (!formData.code || !/^[A-Za-z0-9]{6}$/.test(formData.code)) newErrors.code = 'Código deve ter 6 caracteres alfanuméricos.'
		if (!formData.brand) newErrors.brand = 'Escolha uma marca ou crie uma nova.'
		if (!formData.category) newErrors.category = 'Escolha uma categoria ou crie uma nova.'
		if (!formData.unit) newErrors.unit = 'Unidade é obrigatória.'
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!validate()) return
		onSubmit(formData)
		setFormData({ name: '', code: '', brand: '', category: '', unit: 'KG', price: '' })
	}

	const handleQuickCreate = (type, value) => {
		if (onQuickCreate) {
			onQuickCreate(type, value)
		} else {
			if (type === 'brand') setLocalBrands(prev => [...prev, value])
			if (type === 'category') setLocalCategories(prev => [...prev, value])
		}
		setFormData(prev => ({ ...prev, [type === 'brand' ? 'brand' : 'category']: value }))
		setQuickOpen({ open: false, type: null })
	}

	return (
		<FormContainer>
			<div className='form-header'>
				<span className='material-symbols-outlined icon'>add_box</span>
				<h3>Cadastro de Novo Produto</h3>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='form-grid'>
					<div className='full-width'>
						<Input label='Nome do Produto' name='name' value={formData.name} onChange={handleChange} placeholder='e.g. T-Bone Steak Premium' required />
						{errors.name && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.name}</div>}
					</div>

					<Input label='Código (6 caracteres)' name='code' value={formData.code} onChange={handleChange} placeholder='EX: ANCHO1' required />
					{errors.code && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.code}</div>}

					<div>
						<label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#5a403c',marginBottom:8,display:'block'}}>Marca</label>
						<div style={{display:'flex',gap:8,alignItems:'center'}}>
							<select name='brand' value={formData.brand} onChange={handleChange} style={{flex:1,padding:12,border:'1px solid #e7e5e4',borderRadius:8}} required>
								<option value=''>Selecionar Marca</option>
								{brandsList.map(b => <option key={b} value={b}>{b}</option>)}
							</select>
							<Button type='button' full={false} small onClick={() => setQuickOpen({ open: true, type: 'brand' })}>+</Button>
						</div>
						{errors.brand && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.brand}</div>}
					</div>

					<div>
					<div>
						<label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#5a403c',marginBottom:8,display:'block'}}>Categoria</label>
						<div style={{display:'flex',gap:8,alignItems:'center'}}>
							<select name='category' value={formData.category} onChange={handleChange} style={{flex:1,padding:12,border:'1px solid #e7e5e4',borderRadius:8}} required>
								<option value=''>Selecionar Categoria</option>
								{categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
							</select>
							<Button type='button' full={false} small onClick={() => setQuickOpen({ open: true, type: 'category' })}>+</Button>
						</div>
						{errors.category && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.category}</div>}
					</div>
					</div>

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
							Unidade de Medida
						</label>
						<div className='radio-group'>
							<label>
								<input type='radio' name='unit' value='KG' checked={formData.unit === 'KG'} onChange={handleChange} />
								Kg
							</label>
							<label>
								<input type='radio' name='unit' value='UN' checked={formData.unit === 'UN'} onChange={handleChange} />
								Un
								{errors.unit && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.unit}</div>}
							</label>
						</div>
					</div>

					<div className='full-width'>
						<Input label='Preço Base de Venda (R$)' name='price' type='number' value={formData.price} onChange={handleChange} placeholder='0.00' step='0.01' />
					</div>
				</div>

				<Button type='submit' style={{ width: '100%', marginTop: '24px' }}>
					Salvar Produto
				</Button>

				{quickOpen.open && (
					<QuickCreateModal open={quickOpen.open} type={quickOpen.type} onClose={() => setQuickOpen({ open: false, type: null })} onCreate={(value) => handleQuickCreate(quickOpen.type, value)} />
				)}
			</form>
		</FormContainer>
	)
}
