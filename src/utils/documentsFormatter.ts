import {
  CompositionStatusKind,
  DocumentReferenceStatusKind,
  EncounterStatusKind
} from '@ahryman40k/ts-fhir-types/lib/R4'

export const getDocumentStatus = (status?: CompositionStatusKind | DocumentReferenceStatusKind): string => {
  switch (status) {
    case CompositionStatusKind._amended:
      return 'Corrigé'
    case CompositionStatusKind._enteredInError:
    case DocumentReferenceStatusKind._enteredInError:
      return 'Annulé'
    case CompositionStatusKind._final:
    case DocumentReferenceStatusKind._current:
      return 'Validé'
    case CompositionStatusKind._preliminary:
      return 'Préliminaire'
    default:
      return 'Statut inconnu'
  }
}

export const getEncounterStatus = (status?: EncounterStatusKind): string => {
  switch (status) {
    case EncounterStatusKind._planned:
      return 'en pré-admission'
    case EncounterStatusKind._inProgress:
      return 'ouverte'
    case EncounterStatusKind._finished:
      return 'fermée'
    case EncounterStatusKind._cancelled:
      return 'annulée'
    case EncounterStatusKind._enteredInError:
      return 'entrée par erreur'
    default:
      return 'statut inconnu'
  }
}
