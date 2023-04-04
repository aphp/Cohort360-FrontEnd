import { AxiosResponse } from 'axios'
import apiBackend from 'services/apiBackend'

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
      console.error("erreur lors de l'exécution de la fonction authenticate", error)
      return error
    }
  },

  logout: async () => {
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
