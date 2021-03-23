import axios from 'axios'
import { ACCES_TOKEN, BACK_API_URL } from '../constants'

const apiBackCohort = axios.create({
  baseURL: BACK_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiBackCohort.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

apiBackCohort.interceptors.response.use(
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

export default apiBackCohort
