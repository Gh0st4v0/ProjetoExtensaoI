import api from './apiClient'

export const createSale = (payload) => api.post('/sales', payload).then(r => r.data)
export const getSale = (id) => api.get(`/sales/${id}`).then(r => r.data)

export default { createSale, getSale }
