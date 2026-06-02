import api from './apiClient'

const unwrapList = (resp) => {
  const data = resp?.data
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.content)) return data.content
  return []
}

export const getUsers = () => api.get('/users').then(unwrapList)
export const createUser = (payload) => api.post('/users', payload)
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload)
export const deleteUser = (id) => api.delete(`/users/${id}`)

export default { getUsers, createUser, updateUser, deleteUser }
