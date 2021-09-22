import { ContactSubmitForm } from 'types'
import apiBackend from './apiBackend'

export const postIssue = async (contactSubmitForm: ContactSubmitForm) => {
  try {
    const postIssueResp = await apiBackend.post('/voting/create-issue', contactSubmitForm)

    return postIssueResp.status === 200
  } catch (error) {
    console.error('Erreur lors de la création du ticket', error)
    return false
  }
}
