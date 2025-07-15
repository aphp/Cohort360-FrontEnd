import axios, { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from '../constants'
import { getConfig, onUpdateConfig } from 'config'

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
  config.headers.Authorization = `Bearer ${token}`
  config.headers.authorizationMethod = oidcAuthState === 'true' ? 'OIDC' : 'JWT'
  requestsConfigHooks.forEach((hook) => hook(config))
  return config
})

apiBackend.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if (error.response) {
      if (
        (error.response.status === 401 || error.response.status === 400 || error.response.status === 403) &&
        window.location.pathname !== '/'
      ) {
        localStorage.clear()
        window.location.assign('/')
      }
      return error
    }
  }
)

export default apiBackend
