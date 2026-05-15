const TOKEN_KEY = 'authToken'
const MAX_AGE = 60 * 60 * 24 // 1 dia em segundos (igual ao JWT_EXPIRATION do backend)

function buildCookieString(name, value, maxAge) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  return `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secure}`
}

export function getToken() {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(TOKEN_KEY + '='))
  return match ? match.split('=').slice(1).join('=') : null
}

export function setToken(token) {
  document.cookie = buildCookieString(TOKEN_KEY, token, MAX_AGE)
}

export function removeToken() {
  document.cookie = buildCookieString(TOKEN_KEY, '', 0)
}

// Decodifica o payload do JWT e verifica se ainda não expirou.
// Feito localmente sem chamada ao servidor — o servidor vai rejeitar tokens inválidos
// nas chamadas de API de qualquer forma.
export function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
