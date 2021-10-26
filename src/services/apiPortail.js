import axios from 'axios'
import { ACCES_TOKEN, PORTAIL_API_URL } from '../constants'

const apiPortail = axios.create({
  baseURL: PORTAIL_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiPortail.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

apiPortail.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if ((401 || 400 || 403) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }
    return error
  }
)

export default apiPortail
