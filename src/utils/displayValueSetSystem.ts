import { MEDICATION_ATC, MEDICATION_UCD } from '../constants'

export const displaySystem = (system?: string) => {
  switch (system) {
    case MEDICATION_ATC:
      return 'ATC: '
    case MEDICATION_UCD:
      return 'UCD: '
    default:
      return ''
  }
}
