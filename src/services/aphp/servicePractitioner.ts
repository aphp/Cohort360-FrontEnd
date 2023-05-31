import { AxiosResponse } from 'axios'
import apiBackend from 'services/apiBackend'
import { ACCES_TOKEN, REFRESH_TOKEN } from '../../constants'

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
  authenticate: (username: string, password: string) => Promise<any>
  authenticateCode: (code: string) => Promise<any>

  /**
   * Cette fonction permet d'appeler la route de logout
   *
   */
  logout: () => Promise<void>

  /**
   * Maintenance
   */
  maintenance: () => Promise<any>

  /**
   * Cette fonction nous retourne les informations relative à un pratitioner
   *
   * Argument:
   *   - username: Identifiant du practitioner
   *
   * Retourne:
   *  - id: Identifiant technique du practitioner
   *  - userName: Identifiant AP-HP
   *  - displayName: Nom + prénom du practitioner
   *  - firstName: Prénom du practitioner
   *  - lastName: Nom du practitioner
   */
  fetchPractitioner: (username: string) => Promise<{
    id: number
    displayName: string
    firstName: string
    lastName: string
  } | null>
}

const servicePractitioner: IServicePractitioner = {
  authenticate: async (username, password) => {
    try {
      const formData = new FormData()
      formData.append('username', username.toString())
      formData.append('password', password)

      return await apiBackend.post(`/accounts/login/`, formData)
    } catch (error) {
      console.error('Error authenticating with credentials', error)
      return error
    }
  },

  authenticateCode: async (authCode: string) => {
    try {
      const res = await apiBackend.post(`/auth/oidc/login`, { auth_code: authCode })
      if (res.status === 200) {
        localStorage.setItem(ACCES_TOKEN, res.data.jwt.access)
        localStorage.setItem(REFRESH_TOKEN, res.data.jwt.refresh)
      }
      return res
    } catch (error) {
      console.error('Error authenticating with an authorization code', error)
      return error
    }
  },

  logout: async () => {
    localStorage.clear()
    await apiBackend.post(`/accounts/logout/`)
  },

  maintenance: async () => {
    try {
      return await apiBackend.get(`/maintenances/next/`)
    } catch (error) {
      console.error("erreur lors de l'éxécution de la fonction maintenance", error)
      return error
    }
  },

  fetchPractitioner: async (username) => {
    try {
      const practitioner: any = await apiBackend.get<AxiosResponse>(`/users/${username}/`)

      if (!practitioner || (practitioner && !practitioner.data)) {
        return null
      }

      const id = practitioner.data.provider_id
      const userName = practitioner.data.provider_username
      const firstName = practitioner.data.firstname
      const lastName = practitioner.data.lastname
      const displayName = `${firstName} ${lastName}`
      const response = practitioner

      return {
        id,
        userName,
        displayName,
        firstName,
        lastName,
        response
      }
    } catch (error: any) {
      console.error("Erreur lors de l'éxécution de la fonction fetchPractitioner", error)
      return error
    }
  }
}

export default servicePractitioner
