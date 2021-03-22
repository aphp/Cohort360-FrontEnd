import axios from 'axios'
import { FHIR_API_URL, PRACTITIONER_ID } from '../constants'
import { removeTokens } from './arkhnAuth/oauth/tokenManager'

const api = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(PRACTITIONER_ID)
  config.headers.Authorization = `${token}`
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  async function (error) {
    if ((401 || 400) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }

    const originalRequest = error.config

    if (error.response.status === 401) {
      removeTokens()
      return Promise.reject(error)
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      return axios(originalRequest)
    }
    return Promise.reject(error)
  }
)

export default api
