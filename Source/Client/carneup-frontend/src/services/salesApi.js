import api from './apiClient'

export const createSale = async (payload) => {
  const r = await api.post('/sales', payload)
  const location = r.headers?.location || r.headers?.Location || ''
  const saleId = Number(location.split('/').pop()) || null
  return { saleId }
}

export const getSale = (id) => api.get(`/sales/${id}`).then(r => r.data)
export const searchClients = (q) => api.get('/clients/search', { params: { q, page: 0 } }).then(r => r.data?.content || [])
export const createClient = (data) => {
  const payload = typeof data === 'string' ? { nickname: data } : data
  return api.post('/clients', payload).then(r => r.headers?.location?.split('/').pop())
}
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const getAllClients = () => api.get('/clients').then(r => r.data)
export const getClientSales = (id) => api.get(`/clients/${id}/sales`).then(r => r.data)

export default { createSale, getSale, searchClients, createClient }
