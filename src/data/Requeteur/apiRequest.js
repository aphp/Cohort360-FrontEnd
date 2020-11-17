import axios from 'axios'
import { ACCES_TOKEN, REQUEST_API_URL } from '../../constants'

const apiRequest = axios.create({
  baseURL: REQUEST_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

apiRequest.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if ((401 || 400) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }
  }
)

export default apiRequest
