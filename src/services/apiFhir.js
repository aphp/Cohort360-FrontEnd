import axios from 'axios'
import { ACCES_TOKEN, FHIR_API_URL } from '../constants'

const apiFhir = axios.create({
  baseURL: FHIR_API_URL,
  headers: {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/json'
  }
})

apiFhir.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiFhir
