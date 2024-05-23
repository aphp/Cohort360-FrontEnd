import { DocumentReference } from 'fhir/r4'
import { DocumentStatuses } from 'types/searchCriterias'

export const getDocumentStatus = (status?: DocumentReference['docStatus']): string => {
  switch (status) {
    case DocumentStatuses.FINAL:
      return 'Validé'
    case DocumentStatuses.PRELIMINARY:
      return 'Non Validé'
    default:
      return 'Statut inconnu'
  }
}
