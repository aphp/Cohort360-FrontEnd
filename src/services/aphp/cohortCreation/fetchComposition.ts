import docTypes from 'assets/docTypes.json'

export const fetchDocTypes = () => {
  return docTypes && docTypes.docTypes.length > 0 ? docTypes.docTypes : []
}
