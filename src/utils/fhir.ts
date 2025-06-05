import { Element as FhirElement, Extension, Condition, CodeableConcept } from 'fhir/r4'

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

export const getCategory = (resource: Condition | undefined, url?: string): CodeableConcept | undefined => {
  if (resource?.category && url) {
    return resource.category.find((e) => e?.coding?.find((a) => a.system === url))
  }
  return undefined
}
