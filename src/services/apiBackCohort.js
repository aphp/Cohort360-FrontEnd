import axios from 'axios'
import { BACK_API_URL } from '../constants'
import Cookies from 'js-cookie'

const apiBackCohort = axios.create({
  baseURL: BACK_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken')
  }
})

// apiBackCohort.interceptors.request.use((config) => {
//   const token = localStorage.getItem(ACCES_TOKEN)
//   config.headers.Authorization = `Bearer ${token}`
//   return config
// })

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
