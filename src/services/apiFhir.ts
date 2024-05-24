import axios, { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN, FHIR_API_URL, BOOLEANTRUE } from '../constants'

const apiFhir = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/json'
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestsConfigHooks: Array<(config: InternalAxiosRequestConfig<any>) => void> = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addRequestConfigHook = (hook: (config: InternalAxiosRequestConfig<any>) => void) => {
  requestsConfigHooks.push(hook)
}

export const getAuthorizationMethod = () => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  return oidcAuthState === `${BOOLEANTRUE}` ? 'OIDC' : 'JWT'
}

apiFhir.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = getAuthorizationMethod()
  requestsConfigHooks.forEach((hook) => hook(config))
  return config
})

export default apiFhir
