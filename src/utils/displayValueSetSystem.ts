import { MEDICATION_ATC, MEDICATION_UCD } from '../constants'
import { ValueSetSystem } from '../types'

export const displaySystem = (system: ValueSetSystem) => {
  switch (system) {
    case MEDICATION_ATC:
      return 'ATC: '
    case MEDICATION_UCD:
      return 'UCD: '
    default:
      return ''
  }
}
