import api from './apiClient'

export const getDespesas = (startDate, endDate) => api.get('/despesas', { params: { startDate, endDate } }).then(r => r.data)
export const createDespesa = (payload) => api.post('/despesas', payload)
export const updateDespesa = (id, payload) => api.put(`/despesas/${id}`, payload)
export const deleteDespesa = (id) => api.delete(`/despesas/${id}`)

export default { getDespesas, createDespesa, updateDespesa, deleteDespesa }
