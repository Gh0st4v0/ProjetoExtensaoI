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

const normalizeOptions = (arr) => (arr || []).map(item => {
	if (typeof item === 'string') return { id: item, name: item }
	if (!item || typeof item !== 'object') return { id: String(item), name: String(item) }
	const id = item.id ?? item.brandId ?? item.categoryId ?? item.value ?? item._id ?? item.id
	const name = item.brandName ?? item.categoryName ?? item.name ?? item.label ?? String(item)
	return { id: String(id), name }
})

export const ProductForm = ({ onSubmit, brands: propBrands = [], categories: propCategories = [], onQuickCreate }) => {
	const [formData, setFormData] = useState({
		name: '',
		code: '',
		brandId: '',
		categoryId: '',
		unit: 'KG',
		price: '',
		perecivel: false,
	})

	const [localBrands, setLocalBrands] = useState([])
	const [localCategories, setLocalCategories] = useState([])

	const brandsOptions = (propBrands && propBrands.length) ? normalizeOptions(propBrands) : (localBrands.length ? localBrands.map(v => ({ id: v, name: v })) : ['Heritage Farms','PrimeCuts','Local Ranch'].map(v => ({ id: v, name: v })))
	const categoriesOptions = (propCategories && propCategories.length) ? normalizeOptions(propCategories) : (localCategories.length ? localCategories.map(v => ({ id: v, name: v })) : ['Bovine','Porcine','Poultry','Lamb','Processed'].map(v => ({ id: v, name: v })))

	const [quickOpen, setQuickOpen] = useState({ open: false, type: null })
	const [errors, setErrors] = useState({})
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target
		if (type === 'checkbox') {
			setFormData(prev => ({ ...prev, [name]: checked }))
		} else {
			setFormData(prev => ({ ...prev, [name]: value }))
		}
		setErrors(prev => ({ ...prev, [name]: null }))
	}

	const validate = () => {
		const newErrors = {}
		if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Nome é obrigatório.'
		if (!formData.code || !/^[A-Za-z0-9]{6}$/.test(formData.code)) newErrors.code = 'Código deve ter 6 caracteres alfanuméricos.'
		if (!formData.brandId) newErrors.brandId = 'Escolha uma marca ou crie uma nova.'
		if (!formData.categoryId) newErrors.categoryId = 'Escolha uma categoria ou crie uma nova.'
		if (!formData.unit) newErrors.unit = 'Unidade é obrigatória.'
		if (formData.price === '' || formData.price === null || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Preço de venda é obrigatório e deve ser >= 0.'
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!validate()) return
		onSubmit(formData)
		setFormData({ name: '', code: '', brandId: '', categoryId: '', unit: 'KG', price: '', perecivel: false })
	}

	const handleQuickCreate = async (type, value) => {
		if (onQuickCreate) {
			const created = await onQuickCreate(type, value)
			if (created && created.id) {
				if (type === 'brand') setFormData(prev => ({ ...prev, brandId: String(created.id) }))
				else setFormData(prev => ({ ...prev, categoryId: String(created.id) }))
			} else {
				if (type === 'brand') setFormData(prev => ({ ...prev, brandId: value }))
				else setFormData(prev => ({ ...prev, categoryId: value }))
			}
		} else {
			if (type === 'brand') setLocalBrands(prev => [...prev, value])
			if (type === 'category') setLocalCategories(prev => [...prev, value])
			if (type === 'brand') setFormData(prev => ({ ...prev, brandId: value }))
			else setFormData(prev => ({ ...prev, categoryId: value }))
		}
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
							<select name='brandId' value={formData.brandId} onChange={handleChange} style={{flex:1,padding:12,border:'1px solid #e7e5e4',borderRadius:8}} required>
								<option value=''>Selecionar Marca</option>
								{brandsOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
							</select>
							<Button type='button' full={false} small onClick={() => setQuickOpen({ open: true, type: 'brand' })}>+</Button>
						</div>
						{errors.brandId && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.brandId}</div>}
					</div>
					<div>
					<div>
						<label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#5a403c',marginBottom:8,display:'block'}}>Categoria</label>
						<div style={{display:'flex',gap:8,alignItems:'center'}}>
							<select name='categoryId' value={formData.categoryId} onChange={handleChange} style={{flex:1,padding:12,border:'1px solid #e7e5e4',borderRadius:8}} required>
								<option value=''>Selecionar Categoria</option>
								{categoriesOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
							</select>
							<Button type='button' full={false} small onClick={() => setQuickOpen({ open: true, type: 'category' })}>+</Button>
						</div>
						{errors.categoryId && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.categoryId}</div>}
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
							</label>
							<label style={{display:'flex',alignItems:'center',gap:8,marginLeft:16}}>
								<input type='checkbox' name='perecivel' checked={formData.perecivel} onChange={handleChange} />
								<span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',color:'#5a403c'}}>Perecível</span>
							</label>
						</div>
						{errors.unit && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.unit}</div>}
					</div>
					<div className='full-width'>
						<Input label='Preço Base de Venda (R$)' name='price' type='number' value={formData.price} onChange={handleChange} placeholder='0.00' step='0.01' />
						{errors.price && <div style={{color:'#bf2b2b',fontSize:13,marginTop:6}}>{errors.price}</div>}
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

export default ProductForm
