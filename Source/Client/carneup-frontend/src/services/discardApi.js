import api from './apiClient'

export const getDiscards = () => api.get('/discards').then(r => r.data)
export const createDiscard = (payload) => api.post('/discards', payload)
export const getStockLots = () => api.get('/products/purchases').then(r => r.data)

export default { getDiscards, createDiscard, getStockLots }
