import { ContactSubmitForm } from 'types'
import apiBackCohort from './apiBackCohort'

export const postIssue = async (contactSubmitForm: ContactSubmitForm) => {
  try {
    const requestHeader = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const postIssueResp = await apiBackCohort.post('/voting/create-issue', contactSubmitForm, requestHeader)

    return postIssueResp.status === 201
  } catch (error) {
    console.error('Erreur lors de la création du ticket', error)
    return false
  }
}
