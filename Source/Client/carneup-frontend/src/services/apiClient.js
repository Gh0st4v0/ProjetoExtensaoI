import axios from 'axios'
import { getToken, removeToken } from './cookieUtils'

const api = axios.create({
    // Em dev local, bate no backend. Em prod/stage, bate no próprio domínio do front na rota /api
    baseURL: import.meta.env.DEV ? 'http://localhost:8080' : '/api', 
    headers: { 'Content-Type': 'application/json' }
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
