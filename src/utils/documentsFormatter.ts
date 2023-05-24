import docTypes from 'assets/docTypes.json'
import { CompositionStatusKind, DocumentReferenceStatusKind, EncounterStatusKind } from 'types'

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

export const getProcedureStatus = (status?: string): string => {
  switch (status) {
    case 'preparation':
      return 'En préparation'
    case 'in-progress':
      return 'Ouverte'
    case 'on-hold':
      return 'En attente'
    case 'stopped':
      return 'Annulé'
    case 'completed':
      return 'Terminé'
    case 'entered-in-error':
      return 'Entré par erreur'
    default:
      return 'Statut inconnu'
  }
}

export const getDisplayingSelectedDocTypes = (selectedDocTypes: any[]) => {
  let displayingSelectedDocTypes: any[] = []
  const allTypes = docTypes.docTypes.map((docType: any) => docType.type)

  for (const selectedDocType of selectedDocTypes) {
    const numberOfElementFromGroup = (allTypes.filter((type) => type === selectedDocType.type) || []).length
    const numberOfElementSelected = (
      selectedDocTypes.filter((selectedDoc) => selectedDoc.type === selectedDocType.type) || []
    ).length

    if (numberOfElementFromGroup === numberOfElementSelected) {
      const groupIsAlreadyAdded = displayingSelectedDocTypes.find((dsdt) => dsdt.label === selectedDocType.type)
      if (groupIsAlreadyAdded) continue

      displayingSelectedDocTypes = [
        ...displayingSelectedDocTypes,
        { type: selectedDocType.type, label: selectedDocType.type, code: selectedDocType.type }
      ]
    } else {
      displayingSelectedDocTypes = [...displayingSelectedDocTypes, selectedDocType]
    }
  }
  return displayingSelectedDocTypes.filter((item, index, array) => array.indexOf(item) === index)
}
