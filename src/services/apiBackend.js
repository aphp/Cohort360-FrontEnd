import axios from 'axios'
import { ACCESS_TOKEN, BACK_API_URL } from '../constants'

const apiBackend = axios.create({
  baseURL: BACK_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiBackend.interceptors.request.use((config) => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  const token = localStorage.getItem(ACCESS_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = oidcAuthState === true ? 'OIDC' : 'JWT'
  return config
})

apiBackend.interceptors.response.use(
  (response) => {
    if (response) return response
  },
  function (error) {
    if (error.response) {
      console.log('window.location.path', window.location.pathname)
      if ((401 || 400 || 403) === error.response.status && window.location.pathname !== '/') {
        localStorage.clear()
        window.location = '/'
      }
      return error
    }
  }
)

export default apiBackend
