import apiBackend from 'services/apiBackend'
import {REFRESH_TOKEN} from "../../constants";

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
  authenticateWithCredentials: (username: string, password: string) => Promise<any>
  authenticateWithCode: (code: string) => Promise<any>

  /**
   * Cette fonction permet d'appeler la route de logout
   *
   */
  logout: () => Promise<void>

  /**
   * Maintenance
   */
  maintenance: () => Promise<any>
}

const servicePractitioner: IServicePractitioner = {
  authenticateWithCredentials: async (username, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username.toString())
      formData.append('password', password)

      return await apiBackend.post(`/auth/login/`, formData)
    } catch (error) {
      console.error('Error authenticating with credentials', error)
      return error
    }
  },

  authenticateWithCode: async (authCode: string) => {
    try {
      return await apiBackend.post(`/auth/oidc/login`, { auth_code: authCode })
    } catch (error) {
      console.error('Error authenticating with an authorization code', error)
      return error
    }
  },

  logout: async () => {
    await apiBackend.post(`/auth/logout/`, { refresh_token: localStorage.getItem(REFRESH_TOKEN) })
    localStorage.clear()
  },

  maintenance: async () => {
    try {
      return await apiBackend.get(`/maintenances/next/`)
    } catch (error) {
      console.error("erreur lors de l'éxécution de la fonction maintenance", error)
      return error
    }
  }
}

export default servicePractitioner
