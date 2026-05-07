import api from './apiClient'

export const createPurchase = (payload) => api.post('/purchases', payload)

export default { createPurchase }
