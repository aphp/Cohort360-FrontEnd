import { CONTEXT } from '../../constants'
import docTypes from 'assets/docTypes.json'
import { capitalizeFirstLetter } from 'utils/capitalize'

export const fetchDocTypes = () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return docTypes && docTypes.docTypes.length > 0
      ? docTypes.docTypes.map((_docType: { code: string; label: string; type: string }) => ({
          id: _docType.code,
          label: capitalizeFirstLetter(_docType.label),
          type: _docType.type
        }))
      : []
  } else {
    return docTypes && docTypes.docTypes.length > 0
      ? docTypes.docTypes.map((_docType: { code: string; label: string; type: string }) => ({
          id: _docType.code,
          label: capitalizeFirstLetter(_docType.label),
          type: _docType.type
        }))
      : []
  }
}
