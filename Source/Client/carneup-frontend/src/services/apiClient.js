import axios from 'axios'
import { getToken, removeToken } from './cookieUtils'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
	headers: {
		'Content-Type': 'application/json'
	}
})

api.interceptors.request.use((config) => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			removeToken()
			localStorage.removeItem('userName')
			localStorage.removeItem('userId')
			localStorage.removeItem('accessLevel')
			window.location.reload()
		}
		return Promise.reject(error)
	}
)

export default api
