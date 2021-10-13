import { ContactSubmitForm } from 'types'
import apiBackend from './apiBackend'

export const postIssue = async (contactSubmitForm: ContactSubmitForm) => {
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
