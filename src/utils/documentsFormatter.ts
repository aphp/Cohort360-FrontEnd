import { DocumentReference } from 'fhir/r4'

export const getDocumentStatus = (status?: DocumentReference['docStatus']): string => {
  switch (status) {
    case 'final':
      return 'Validé'
    case 'preliminary':
      return 'Non Validé'
    default:
      return 'Statut inconnu'
  }
}
