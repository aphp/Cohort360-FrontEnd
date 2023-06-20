import axios from 'axios'
import { ACCESS_TOKEN, FHIR_API_URL, BOOLEANTRUE } from '../constants'

const apiFhir = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/json'
  }
})

export const getAuthorizationMethod = () => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  return oidcAuthState === `${BOOLEANTRUE}` ? 'OIDC' : 'JWT'
}

apiFhir.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = getAuthorizationMethod()
  return config
})

export default apiFhir
