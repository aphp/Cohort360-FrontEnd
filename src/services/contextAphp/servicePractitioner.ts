import axios from 'axios'

import { BACK_API_URL } from '../../constants'

import { fetchPractitioner } from './callApi'

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
    userName: number
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

      return await axios({
        method: 'POST',
        url: `${BACK_API_URL}/accounts/login/`,
        data: formData
      })
    } catch (error) {
      console.error("erreur lors de l'éxécution de la fonction authenticate", error)
      return error
    }
  },

  logout: async () => {
    await axios({
      method: 'POST',
      url: `${BACK_API_URL}/accounts/logout/`
    })
  },

  maintenance: async () => {
    try {
      return await axios({
        method: 'GET',
        url: `${BACK_API_URL}/maintenance/`
      })
    } catch (error) {
      console.error("erreur lors de l'éxécution de la fonction maintenance", error)
      return error
    }
  },

  fetchPractitioner: async (username) => {
    try {
      const practitioner = await fetchPractitioner({
        identifier: username
      })

      if (
        !practitioner ||
        (practitioner && !practitioner.data) ||
        // @ts-ignore
        (practitioner && practitioner.data && !practitioner.data.entry)
      ) {
        return null
      }

      // @ts-ignore
      const { resource } = practitioner.data.entry[0]
      const id = resource.id
      const userName = resource.identifier[0].value
      const firstName = resource.name[0].given.join(' ')
      const lastName = resource.name[0].family
      const displayName = `${lastName} ${firstName}`
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
      console.error("erreur lors de l'éxécution de la fonction fetchPractitioner", error)
      return error
    }
  }
}

export default servicePractitioner
