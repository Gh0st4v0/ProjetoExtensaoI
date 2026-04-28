import api from './apiClient'

export const getAllBrands = async () => {
	const res = await api.get('/brands')
	return res.data
}

export const createBrand = async (name) => {
	return api.post('/brands', { name })
}

export const updateBrand = async (id, name) => {
	return api.put(`/brands/${id}`, { name })
}

export const deleteBrand = async (id) => {
	return api.delete(`/brands/${id}`)
}

export const getAllCategories = async () => {
	const res = await api.get('/categories')
	return res.data
}

export const createCategory = async (name) => api.post('/categories', { name })
export const updateCategory = async (id, name) => api.put(`/categories/${id}`, { name })
export const deleteCategory = async (id) => api.delete(`/categories/${id}`)
