import api from './apiClient'

const unwrapList = (resp) => {
  const data = resp?.data
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.content)) return data.content
  return []
}

export const getDiscards = (params = {}) => api.get('/discards', { params }).then(unwrapList)
export const createDiscard = (payload) => api.post('/discards', payload)
export const updateDiscard = (id, payload) => api.put(`/discards/${id}`, payload)
export const deleteDiscard = (id) => api.delete(`/discards/${id}`)
export const getStockLots = () => api.get('/products/purchases').then(r => r.data)

export default { getDiscards, createDiscard, updateDiscard, deleteDiscard, getStockLots }
