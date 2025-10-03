import axios, { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from '../constants'
import { getConfig, onUpdateConfig } from 'config'

const apiFhir = axios.create({
  baseURL: getConfig().system.fhirUrl,
  headers: {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/json'
  }
})
onUpdateConfig((newConfig) => {
  apiFhir.defaults.baseURL = newConfig.system.fhirUrl
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestsConfigHooks: Array<(config: InternalAxiosRequestConfig<any>) => void> = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addRequestConfigHook = (hook: (config: InternalAxiosRequestConfig<any>) => void) => {
  requestsConfigHooks.push(hook)
}

export const getAuthorizationMethod = () => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  return oidcAuthState === 'true' ? 'OIDC' : 'JWT'
}

apiFhir.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN)

  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = getAuthorizationMethod()

  requestsConfigHooks.forEach((hook) => hook(config))
  return config
})

export default apiFhir
