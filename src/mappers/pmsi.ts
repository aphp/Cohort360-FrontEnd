import { Medication, Pmsi } from 'state/patient'
import { CriteriaName } from 'types'
import { PMSILabel } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'

export const mapToCriteriaName = (
  criteria: ResourceType.CLAIM | ResourceType.CONDITION | ResourceType.PROCEDURE
): CriteriaName => {
  const mapping: { [key: string]: CriteriaName } = {
    diagnostic: CriteriaName.Cim10,
    ghm: CriteriaName.Ghm,
    ccam: CriteriaName.Ccam
  }
  const index = criteria === ResourceType.CLAIM ? 'ghm' : ResourceType.CONDITION ? 'diagnostic' : 'ccam'
  if (index in mapping) return mapping[index]
  throw new Error(`Unknown criteria ${criteria}`)
}

export function mapToAttribute(
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
): keyof Medication
export function mapToAttribute(type: ResourceType.CONDITION | ResourceType.CLAIM | ResourceType.PROCEDURE): keyof Pmsi
export function mapToAttribute(type: ResourceType) {
  switch (type) {
    case ResourceType.MEDICATION_ADMINISTRATION:
      return 'administration'
    case ResourceType.MEDICATION_REQUEST:
      return 'prescription'
    case ResourceType.CONDITION:
      return 'condition'
    case ResourceType.CLAIM:
      return 'claim'
    case ResourceType.PROCEDURE:
      return 'procedure'
  }
}

export function mapToLabel(
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
): 'administration(s)' | 'prescriptions'
export function mapToLabel(type: ResourceType.CONDITION | ResourceType.CLAIM | ResourceType.PROCEDURE): PMSILabel
export function mapToLabel(type: ResourceType) {
  switch (type) {
    case ResourceType.CONDITION:
      return PMSILabel.DIAGNOSTIC
    case ResourceType.PROCEDURE:
      return PMSILabel.CCAM
    case ResourceType.CLAIM:
      return PMSILabel.GHM
    case ResourceType.MEDICATION_ADMINISTRATION:
      return 'administration(s)'
    case ResourceType.MEDICATION_REQUEST:
      return 'prescriptions'
  }
}
