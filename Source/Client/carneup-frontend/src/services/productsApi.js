import api from './apiClient'

export const createProduct = (payload) => api.post('/products', payload)
export const getAllProducts = async (page = 0) => {
	const res = await api.get('/products', { params: { page } })
	return res.data
}

export const searchProducts = async (q, page = 0) => {
	const res = await api.get('/products/search', { params: { q, page } })
	return res.data
}

export const updateProductPrice = (id, precoVenda) => api.patch(`/products/${id}/price`, { precoVenda }).then(r => r.data)

export default { createProduct, getAllProducts, searchProducts, updateProductPrice }
