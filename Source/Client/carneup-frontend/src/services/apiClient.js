import axios from 'axios'
import { getToken, removeToken } from './cookieUtils'

// Função inteligente que descobre com quem falar baseada na URL atual
const getBaseUrl = () => {
    // 1. Se você passou alguma variável estrita na hora do build, respeita ela
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    // 2. Modo de desenvolvimento na sua máquina local (npm run dev)
    if (import.meta.env.DEV) return 'http://localhost:8080';

    // 3. ✨ A MÁGICA DO RUNTIME ✨
    // O navegador lê onde o site está hospedado (ex: "stage.carneup.com.br")
    const hostname = window.location.hostname || '';

    // Se a palavra "stage" estiver na URL do frontend, joga pro backend de stage
    if (hostname.includes('stage')) {
        return 'https://stage.api.carneup.com.br';
    }

    // 4. Fallback padrão de Produção
    return 'https://api.carneup.com.br';
}

const api = axios.create({
    baseURL: getBaseUrl(),
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
