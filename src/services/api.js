import axios from 'axios'
import { ACCES_TOKEN, FHIR_API_URL } from '../constants'

const api = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => {
  return response
},
  function (error) {
    if ((401 || 400) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }
  }
)

export default api
