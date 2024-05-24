import axios, { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN, BACK_API_URL, BOOLEANTRUE } from '../constants'

const apiBackend = axios.create({
  baseURL: BACK_API_URL,
  headers: {
    Accept: 'application/json'
  }
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
  config.headers.authorizationMethod = oidcAuthState === `${BOOLEANTRUE}` ? 'OIDC' : 'JWT'
  requestsConfigHooks.forEach((hook) => hook(config))
  return config
})

apiBackend.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if (error.response) {
      if ((401 || 400 || 403) === error.response.status && window.location.pathname !== '/') {
        localStorage.clear()
        window.location.assign('/')
      }
      return error
    }
  }
)

export default apiBackend
