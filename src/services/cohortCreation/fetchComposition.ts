import { CONTEXT } from '../../constants'
import docTypes from '../../assets/docTypes.json'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchDocTypes = () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    return docTypes && docTypes.docTypes.length > 0
      ? docTypes.docTypes.map((_docType: { code: string; label: string }) => ({
          id: _docType.code,
          label: capitalizeFirstLetter(_docType.label)
        }))
      : []
  }
}
