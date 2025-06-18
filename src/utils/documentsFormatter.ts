/**
 * @fileoverview Utility functions for formatting document data
 * @module utils/documentsFormatter
 */

import { DocumentReference } from 'fhir/r4'
import { DocumentStatuses } from 'types/searchCriterias'

/**
 * Formats a FHIR DocumentReference status into a human-readable French string
 *
 * @param status - The DocumentReference status from FHIR resource
 * @returns A formatted status string in French
 *
 * @example
 * ```typescript
 * getDocumentStatus('final') // returns 'Validé'
 * getDocumentStatus('preliminary') // returns 'Non Validé'
 * getDocumentStatus(undefined) // returns 'Statut inconnu'
 * ```
 */
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
