import axios from 'axios'
import { JPYLTIME_URL } from '../constants'

const api = axios.create({
  baseURL: JPYLTIME_URL
})

export default api
