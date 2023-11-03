import { DocumentAttachmentMethod } from 'types/searchCriterias'

export const parseDocumentAttachment = (value: DocumentAttachmentMethod) => {
  const documentAttachment: { documentAttachmentMethod: DocumentAttachmentMethod; daysOfDelay: string | null } = {
    documentAttachmentMethod: DocumentAttachmentMethod.NONE,
    daysOfDelay: null
  }
  if (value === DocumentAttachmentMethod.ACCESS_NUMBER) {
    documentAttachment.documentAttachmentMethod = value
  } else if (value === DocumentAttachmentMethod.INFERENCE_TEMPOREL) {
    documentAttachment.documentAttachmentMethod = DocumentAttachmentMethod.INFERENCE_TEMPOREL
    const matchNumber = value.match(/\d+/)
    if (matchNumber) {
      documentAttachment.daysOfDelay = matchNumber[0]
    }
  }

  return documentAttachment
}
