import api from './apiClient'

export const createSale = async (payload) => {
  const r = await api.post('/sales', payload)
  const location = r.headers?.location || r.headers?.Location || ''
  const saleId = Number(location.split('/').pop()) || null
  return { saleId }
}

export const getSale = (id) => api.get(`/sales/${id}`).then(r => r.data)
export const searchClients = (q) => api.get('/clients/search', { params: { q, page: 0 } }).then(r => r.data?.content || [])
export const createClient = async (data) => {
  const payload = typeof data === 'string' ? { nickname: data } : data
  const r = await api.post('/clients', payload)
  // try Location header first (recommended), otherwise check body, otherwise fallback to search by nickname
  const loc = r.headers?.location || r.headers?.Location
  if (loc) return loc.split('/').pop()
  if (r.data && r.data.id) return String(r.data.id)
  const q = payload.nickname || (typeof data === 'string' ? data : '')
  if (q) {
    const list = await api.get('/clients/search', { params: { q, page: 0 } }).then(rr => rr.data?.content || []).catch(() => [])
    if (Array.isArray(list) && list.length > 0) return String(list[0].id)
  }
  return null
}
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const getAllClients = () => api.get('/clients').then(r => r.data)
export const getClientSales = (id, page = 0, size = 200) => api.get(`/clients/${id}/sales`, { params: { page, size } }).then(r => r.data)
export const getClientSpending = (start, end) => api.get('/sales/clients-spend', { params: { startDate: start, endDate: end } }).then(r => r.data)
export const deleteClient = (id) => api.delete(`/clients/${id}`)

export default { createSale, getSale, searchClients, createClient, updateClient, getAllClients, getClientSales, getClientSpending, deleteClient }
