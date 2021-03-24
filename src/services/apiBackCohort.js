import axios from 'axios'
import { USERNAME_HEADER, BACK_API_URL } from '../constants'
import Cookies from 'js-cookie'

const apiBackCohort = axios.create({
  baseURL: BACK_API_URL,
  withCredentials: true
})

apiBackCohort.interceptors.request.use((config) => {
  config.headers.Username = localStorage.getItem(USERNAME_HEADER)
  config.headers['X-CSRFToken'] = Cookies.get('csrftoken')
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

// FIXME: remove this eventually
// The backend authentifies a user at the first request and open a session
// by creating a session cookie and a csrf token cookie.
// We need to open a Django session before sending any useful requests
// (otherwise we get 403 responses telling us the csrf token is missing).
export const openApiBackSession = () => apiBackCohort.get('/')

export default apiBackCohort
