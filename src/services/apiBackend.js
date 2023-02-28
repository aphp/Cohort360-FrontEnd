import axios from 'axios'
import { ACCES_TOKEN, BACK_API_URL } from '../constants'

const apiBackend = axios.create({
  baseURL: BACK_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiBackend.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiBackend
