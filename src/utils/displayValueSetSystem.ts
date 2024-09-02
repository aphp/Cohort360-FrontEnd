import { getConfig } from 'config'

export const displaySystem = (system?: string) => {
  switch (system) {
    case getConfig().features.medication.valueSets.medicationAtc.url:
      return 'ATC: '
    case getConfig().features.medication.valueSets.medicationUcd.url:
      return 'UCD: '
    default:
      return ''
  }
}
