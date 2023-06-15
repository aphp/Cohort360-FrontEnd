import axios from 'axios'
import { ACCESS_TOKEN, FHIR_API_URL } from '../constants'

const apiFhir = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/json'
  }
})

apiFhir.interceptors.request.use((config) => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  const resultat = oidcAuthState === true ? 'OIDC' : 'JWT'
  console.log('oidcAuthState', oidcAuthState)
  console.log('resultat', resultat)
  const token = localStorage.getItem(ACCESS_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = oidcAuthState === true ? 'OIDC' : 'JWT'
  return config
})

export default apiFhir
