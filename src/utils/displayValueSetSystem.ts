import { ValueSetSystem } from 'types/valueSet'
import { MEDICATION_ATC, MEDICATION_UCD } from '../constants'

export const displaySystem = (system?: ValueSetSystem) => {
  switch (system) {
    case MEDICATION_ATC:
      return 'ATC: '
    case MEDICATION_UCD:
      return 'UCD: '
    default:
      return ''
  }
}
