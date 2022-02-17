import { ContactSubmitForm } from 'types'
import apiBackend from '../apiBackend'

export interface IServiceContact {
  /**
   * Cette fonction permet d'appeler le back-end pour créer un ticket lors d'une prise de contact
   */
  postIssue: (contactSubmitForm: ContactSubmitForm) => Promise<boolean>
}

const serviceContact: IServiceContact = {
  postIssue: async (contactSubmitForm: ContactSubmitForm) => {
    try {
      const requestHeader = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }
      const postIssueResp = await apiBackend.post('/voting/create-issue', contactSubmitForm, requestHeader)

      return postIssueResp.status === 201
    } catch (error) {
      console.error('Erreur lors de la création du ticket', error)
      return false
    }
  }
}

export default serviceContact
