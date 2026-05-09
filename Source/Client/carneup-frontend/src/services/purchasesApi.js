import api from './apiClient'

export const createPurchase = (payload) => api.post('/purchases', payload)
export const getPurchases = async (page = 0) => {
	const res = await api.get('/purchases', { params: { page } })
	return res.data
}

export default { createPurchase, getPurchases }
