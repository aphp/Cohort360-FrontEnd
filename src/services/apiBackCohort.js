import axios from 'axios'
import { PRACTITIONER_ID, BACK_API_URL } from '../constants'

const apiBackCohort = axios.create({
  baseURL: BACK_API_URL,
  headers: {
    Accept: 'application/json'
  }
})

apiBackCohort.interceptors.request.use((config) => {
  config.headers.Username = localStorage.getItem(PRACTITIONER_ID)
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
