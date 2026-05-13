import api from './apiClient'

export const createSale = async (payload) => {
  const r = await api.post('/sales', payload)
  const location = r.headers?.location || r.headers?.Location || ''
  const saleId = Number(location.split('/').pop()) || null
  return { saleId }
}

export const getSale = (id) => api.get(`/sales/${id}`).then(r => r.data)
export const searchClients = (q) => api.get('/clients/search', { params: { q, page: 0 } }).then(r => r.data?.content || [])
export const createClient = (nickname) => api.post('/clients', { nickname }).then(r => r.headers?.location?.split('/').pop())

export default { createSale, getSale, searchClients, createClient }
