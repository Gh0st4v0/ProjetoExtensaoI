import api from './apiClient'

export const getUsers = async () => {
	const res = await api.get('/users')
	return res.data
}

export default { getUsers }
