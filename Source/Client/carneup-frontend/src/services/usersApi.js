import api from './apiClient'

export const getUsers = () => api.get('/users').then(r => r.data)
export const createUser = (payload) => api.post('/users', payload)
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload)
export const deleteUser = (id) => api.delete(`/users/${id}`)

export default { getUsers, createUser, updateUser, deleteUser }
