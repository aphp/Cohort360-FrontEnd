import axios, { AxiosResponse } from 'axios'

import { PORTAIL_API_URL } from '../../constants'

import { fetchPractitioner, fetchPractitionerRole } from './callApi'

export interface IServicesPractitioner {
  /**
   * Fonction qui permet d'authetifier un utilisateur avec un username et un password
   *
   * Argument:
   *  - username: Identifiant du practitioner
   *  - password: Mot de passe du practitioner
   *
   * Retourne la reponse de Axios
   */
  authenticate: (username: string, password: string) => Promise<any>

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

  /**
   * Cette fonction nous retourne les organisations ainsi que les roles attitrés
   *
   * Argument:
   *   - practionerId: Identifiant technique du practitioner
   *
   * Retourne:
   *   - Liste d'organisations + droit attitré
   */
  fetchPractitionerRole: (practionerId: string) => Promise<any>
}

const servicePractitioner: IServicesPractitioner = {
  authenticate: async (username, password) => {
    getCsrfToken(username, password)
    return axios({
      method: 'POST',
      url: '/api/jwt/',
      data: { username: username, password: password }
    })
  },

  fetchPractitioner: async (username) => {
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

    return {
      id,
      userName,
      displayName,
      firstName,
      lastName
    }
  },

  fetchPractitionerRole: async (practitionerId) => {
    const practitionerRole = await fetchPractitionerRole({
      practitioner: practitionerId,
      _elements: ['organization', 'extension']
    })

    if (
      !practitionerRole ||
      (practitionerRole && !practitionerRole.data) ||
      // @ts-ignore
      (practitionerRole && practitionerRole.data && !practitionerRole.data.entry)
    ) {
      return undefined
    } else {
      // @ts-ignore
      const { resource } = practitionerRole.data.entry[0]
      return resource
    }
  }
}

export default servicePractitioner

export const getCsrfToken = (username: string, password: string): Promise<AxiosResponse<any>> => {
  const formData = new FormData()
  formData.append('username', username.toString())
  formData.append('password', password)

  return axios({
    method: 'POST',
    url: `${PORTAIL_API_URL}/accounts/login/`,
    data: formData
  })
}
