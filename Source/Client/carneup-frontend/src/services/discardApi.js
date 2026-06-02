import api from './apiClient'

export const getDiscards = (params = {}) => api.get('/discards', { params }).then(r => r.data)
export const createDiscard = (payload) => api.post('/discards', payload)
export const updateDiscard = (id, payload) => api.put(`/discards/${id}`, payload)
export const deleteDiscard = (id) => api.delete(`/discards/${id}`)
export const getStockLots = () => api.get('/products/purchases').then(r => r.data)

export default { getDiscards, createDiscard, updateDiscard, deleteDiscard, getStockLots }
