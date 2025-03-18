import { Element as FhirElement, Extension } from 'fhir/r4'

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
