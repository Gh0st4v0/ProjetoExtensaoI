import axios from 'axios'
import { getToken, removeToken } from './cookieUtils'

const api = axios.create({
    // Se houver variável usa ela; se não, usa a produção (resolve a AWS);
    // Mas se o Vite detectar que está em modo de desenvolvimento local, podemos forçar o localhost.
    baseURL: import.meta.env.VITE_API_URL ||
             (import.meta.env.DEV ? 'http://localhost:8080' : 'https://stage.api.carneup.com.br'),
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
