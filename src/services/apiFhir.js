import axios from 'axios'
import { ACCES_TOKEN, FHIR_API_URL, TOKEN_URL } from '../constants'
import { refreshToken, removeTokens } from './arkhnAuth/oauth/tokenManager'

const apiFhir = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json'
  }
})

apiFhir.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

apiFhir.interceptors.response.use(
  (response) => {
    return response
  },
  async function (error) {
    if ((401 || 400) === error?.response?.status) {
      localStorage.clear()
      window.location = '/'
    }

    const originalRequest = error.config

    if (error?.response?.status === 401 && originalRequest?.url?.startsWith(TOKEN_URL)) {
      removeTokens()
      return Promise.reject(error)
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const success = await refreshToken()
      if (!success) {
        removeTokens()
        return Promise.reject(error)
      }
      return axios(originalRequest)
    }
    return Promise.reject(error)
  }
)

export default apiFhir
