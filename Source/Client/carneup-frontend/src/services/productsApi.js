import api from './apiClient'

export const createProduct = (payload) => api.post('/products', payload)
export const getAllProducts = async (page = 0) => {
	const res = await api.get('/products', { params: { page } })
	return res.data
}

export const getAllProductsList = async () => {
	const firstPage = await getAllProducts(0)
	const totalPages = firstPage?.totalPages || 1
	const pages = [firstPage]

	if (totalPages > 1) {
		const remainingPages = await Promise.all(
			Array.from({ length: totalPages - 1 }, (_, index) => getAllProducts(index + 1))
		)
		pages.push(...remainingPages)
	}

	return pages.flatMap((page) => page?.content || [])
}

export const searchProducts = async (q, page = 0) => {
	const res = await api.get('/products/search', { params: { q, page } })
	return res.data
}

export const getProductsWithPurchasesInStock = async () => {
	const res = await api.get('/products/purchases')
	return res.data
}

export const updateProductPrice = (id, precoVenda) => api.patch(`/products/${id}/price`, { precoVenda }).then(r => r.data)

export default { createProduct, getAllProducts, getAllProductsList, searchProducts, getProductsWithPurchasesInStock, updateProductPrice }
