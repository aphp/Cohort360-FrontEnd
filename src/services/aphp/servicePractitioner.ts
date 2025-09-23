import apiBackend from 'services/apiBackend'
import { REFRESH_TOKEN } from '../../constants'
import { Authentication, MaintenanceInfo } from 'types'
import { AxiosError, AxiosResponse } from 'axios'
import { getConfig } from 'config'

export interface IServicePractitioner {
  /**
   * Fonction qui permet d'authentifier un utilisateur avec un username et un password
   *
   * Argument:
   *  - username: Identifiant du practitioner
   *  - password: Mot de passe du practitioner
   *
   * Retourne la reponse de Axios
   */
  authenticateWithCredentials: (
    username: string,
    password: string
  ) => Promise<AxiosResponse<Authentication> | AxiosError>
  authenticateWithCode: (code: string) => Promise<AxiosResponse<Authentication> | AxiosError>

  /**
   * Cette fonction permet d'appeler la route de logout
   *
   */
  logout: () => Promise<void>

  /**
   * Maintenance
   */
  maintenance: () => Promise<AxiosResponse<MaintenanceInfo> | AxiosError>
}

const servicePractitioner: IServicePractitioner = {
  authenticateWithCredentials: async (username, password): Promise<AxiosResponse<Authentication> | AxiosError> => {
    try {
      const formData = new FormData()
      formData.append('username', username.toString())
      formData.append('password', password)

      return await apiBackend.post<Authentication>(`/auth/login/`, formData)
    } catch (error) {
      console.error('Error authenticating with credentials', error)
      return error as AxiosError
    }
  },

  authenticateWithCode: async (authCode: string): Promise<AxiosResponse<Authentication> | AxiosError> => {
    try {
      return await apiBackend.post<Authentication>(
        `/auth/login/`,
        {
          auth_code: authCode,
          redirect_uri: getConfig().system.oidc?.redirectUri
        },
        {
          headers: { authorizationMethod: 'OIDC' }
        }
      )
    } catch (error) {
      console.error('Error authenticating with an authorization code', error)
      return error as AxiosError
    }
  },

  logout: async (): Promise<void> => {
    console.log('entrée dans logout')
    // await apiBackend.post(`/auth/logout/`, { refresh_token: localStorage.getItem(REFRESH_TOKEN) })
    // localStorage.clear()
  },

  maintenance: async (): Promise<AxiosResponse<MaintenanceInfo> | AxiosError> => {
    try {
      return await apiBackend.get<MaintenanceInfo>(`/maintenances/next/`)
    } catch (error) {
      console.error("Erreur lors de l'exécution de la fonction maintenance", error)
      return error as AxiosError
    }
  }
}

export default servicePractitioner
