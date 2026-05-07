import React, { useEffect, useState, useCallback } from 'react'
import * as attributesApi from '../services/attributesApi'
import { AttributesContext } from './attributes'

export const AttributesProvider = ({ children }) => {
	const [brands, setBrands] = useState([])
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [brandsData, categoriesData] = await Promise.all([
				attributesApi.getAllBrands(),
				attributesApi.getAllCategories(),
			])
			setBrands(brandsData || [])
			setCategories(categoriesData || [])
		} catch (err) {
			console.error('Failed to load attributes', err)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	const addBrand = async (name) => {
		const res = await attributesApi.createBrand(name)
		await load()
		return res.data
	}

	const updateBrand = async (id, name) => {
		await attributesApi.updateBrand(id, name)
		await load()
	}

	const removeBrand = async (id) => {
		await attributesApi.deleteBrand(id)
		await load()
	}

	const addCategory = async (name) => {
		const res = await attributesApi.createCategory(name)
		await load()
		return res.data
	}

	const updateCategory = async (id, name) => {
		await attributesApi.updateCategory(id, name)
		await load()
	}

	const removeCategory = async (id) => {
		await attributesApi.deleteCategory(id)
		await load()
	}

	return (
		<AttributesContext.Provider value={{
			brands,
			categories,
			loading,
			reload: load,
			addBrand,
			updateBrand,
			removeBrand,
			addCategory,
			updateCategory,
			removeCategory,
		}}>
			{children}
		</AttributesContext.Provider>
	)
}
