import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from '../constants'
import { getConfig, onUpdateConfig } from 'config'

const REFRESH_TOKEN_URL = '/auth/refresh/'

const apiBackend = axios.create({
  baseURL: getConfig().system.backendUrl,
  headers: {
    Accept: 'application/json'
  }
})
onUpdateConfig((newConfig) => {
  apiBackend.defaults.baseURL = newConfig.system.backendUrl
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestsConfigHooks: Array<(config: InternalAxiosRequestConfig<any>) => void> = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addRequestConfigHook = (hook: (config: InternalAxiosRequestConfig<any>) => void) => {
  requestsConfigHooks.push(hook)
}

apiBackend.interceptors.request.use((config) => {
  const oidcAuthState = localStorage.getItem('oidcAuth')
  const token = localStorage.getItem(ACCESS_TOKEN)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  config.headers.authorizationMethod = oidcAuthState === 'true' ? 'OIDC' : 'JWT'

  requestsConfigHooks.forEach((hook) => hook(config))
  return config
})

// une 403 sur /auth/refresh/ signifie que l'access token a expiré, les autres 403 sont des refus de droits
const isSessionLost = (error: AxiosError) =>
  error.response?.status === 401 || (error.response?.status === 403 && !!error.config?.url?.includes(REFRESH_TOKEN_URL))

apiBackend.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if (error.response) {
      if (isSessionLost(error) && window.location.pathname !== '/') {
        localStorage.clear()
        window.location.assign('/')
      }
      return error
    }
  }
)

export default apiBackend
