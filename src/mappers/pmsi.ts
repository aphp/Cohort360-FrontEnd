import { Medication, Pmsi } from 'state/patient'
import { CriteriaNameType, CriteriaName } from 'types'
import { PMSILabel } from 'types/patient'
import { RessourceType } from 'types/requestCriterias'

export const mapToCriteriaName = (
  criteria: RessourceType.CLAIM | RessourceType.CONDITION | RessourceType.PROCEDURE
): CriteriaNameType => {
  const mapping: { [key: string]: CriteriaNameType } = {
    diagnostic: CriteriaName.Cim10,
    ghm: CriteriaName.Ghm,
    ccam: CriteriaName.Ccam
  }
  const index = criteria === RessourceType.CLAIM ? 'ghm' : RessourceType.CONDITION ? 'diagnostic' : 'ccam'
  if (index in mapping) return mapping[index]
  throw new Error(`Unknown criteria ${criteria}`)
}

export function mapToAttribute(
  type: RessourceType.MEDICATION_ADMINISTRATION | RessourceType.MEDICATION_REQUEST
): keyof Medication
export function mapToAttribute(
  type: RessourceType.CONDITION | RessourceType.CLAIM | RessourceType.PROCEDURE
): keyof Pmsi
export function mapToAttribute(type: RessourceType) {
  switch (type) {
    case RessourceType.MEDICATION_ADMINISTRATION:
      return 'administration'
    case RessourceType.MEDICATION_REQUEST:
      return 'prescription'
    case RessourceType.CONDITION:
      return 'condition'
    case RessourceType.CLAIM:
      return 'claim'
    case RessourceType.PROCEDURE:
      return 'procedure'
  }
}

export function mapToLabel(
  type: RessourceType.MEDICATION_ADMINISTRATION | RessourceType.MEDICATION_REQUEST
): 'administration(s)' | 'prescriptions'
export function mapToLabel(type: RessourceType.CONDITION | RessourceType.CLAIM | RessourceType.PROCEDURE): PMSILabel
export function mapToLabel(type: RessourceType) {
  switch (type) {
    case RessourceType.CONDITION:
      return PMSILabel.DIAGNOSTIC
    case RessourceType.PROCEDURE:
      return PMSILabel.CCAM
    case RessourceType.CLAIM:
      return PMSILabel.GHM
    case RessourceType.MEDICATION_ADMINISTRATION:
      return 'administration(s)'
    case RessourceType.MEDICATION_REQUEST:
      return 'prescriptions'
  }
}
