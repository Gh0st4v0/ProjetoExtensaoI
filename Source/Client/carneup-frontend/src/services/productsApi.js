import api from './apiClient'

export const createProduct = (payload) => api.post('/products', payload)
export const getProductById = (id) => api.get(`/products/${id}`).then(r => r.data)
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload)
export const getAllProducts = async (page = 0) => {
	const res = await api.get('/products', { params: { page } })
	return res.data
}

// Busca todas as páginas de produtos de uma vez — usado no PDV onde o caixa
// precisa ver o catálogo completo sem paginação.
export const getAllProductsUnpaged = async () => {
	const first = await api.get('/products', { params: { page: 0 } })
	const data = first.data
	const totalPages = data.totalPages || 1
	let all = data.content || []
	for (let p = 1; p < totalPages; p++) {
		const r = await api.get('/products', { params: { page: p } })
		all = [...all, ...(r.data.content || [])]
	}
	return all
}

export const searchProducts = async (q, page = 0) => {
	const res = await api.get('/products/search', { params: { q, page } })
	return res.data
}

export const updateProductPrice = (id, precoVenda) => api.patch(`/products/${id}/price`, { precoVenda }).then(r => r.data)

export default { createProduct, getProductById, updateProduct, getAllProducts, searchProducts, updateProductPrice }
