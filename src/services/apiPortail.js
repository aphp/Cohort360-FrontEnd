import axios from 'axios'
import { ACCES_TOKEN, PORTAIL_API_URL } from '../constants'

const apiPortailCohort = axios.create({
  baseURL: PORTAIL_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiPortailCohort.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCES_TOKEN)
  config.headers.Authorization = `Bearer ${token}`
  return config
})

apiPortailCohort.interceptors.response.use(
  (response) => {
    return response
  },
  function (error) {
    if ((401 || 400) === error.response.status) {
      localStorage.clear()
      window.location = '/'
    }
    return error
  }
)

export default apiPortailCohort
