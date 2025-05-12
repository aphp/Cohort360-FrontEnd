import { getConfig } from 'config'
import { Element as FhirElement, Extension, CodeableConcept, Coding, Condition } from 'fhir/r4'

export const getExtension = (
  resource: FhirElement | undefined,
  url?: string,
  ...alternativeUrls: string[]
): Extension | undefined => {
  if (resource?.extension && url) {
    return resource.extension.find((item) => item.url === url || alternativeUrls.includes(item.url || ''))
  }
  return undefined
}

export const getPreferedCode = (code?: CodeableConcept): Coding | undefined => {
  return (
    code?.coding?.find((c) => c.userSelected === true) ||
    (!getConfig().core.fhir.selectedCodeOnly ? code?.coding?.[0] : undefined)
  )
}
