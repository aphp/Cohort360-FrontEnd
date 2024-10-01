import axios from 'axios'
import { getConfig, onUpdateConfig } from 'config'

const apiDatamodel = axios.create({
  baseURL: getConfig().system.datamodelUrl,
  headers: {
    Accept: 'application/json'
  }
})
onUpdateConfig((newConfig) => {
  apiDatamodel.defaults.baseURL = newConfig.system.datamodelUrl
})

apiDatamodel.interceptors.response.use((response) => {
  return response
})

export default apiDatamodel
