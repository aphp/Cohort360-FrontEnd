import { Condition } from 'fhir/r4'
import { GenderStatus, VitalStatus } from 'types/searchCriterias'

export const genderName = (gender: GenderStatus | null): string | null => {
  switch (gender) {
    case GenderStatus.FEMALE:
      return 'Genre: Femmes'
    case GenderStatus.MALE:
      return 'Genre: Hommes'
    case GenderStatus.OTHER:
      return 'Genre: Autre'
    case GenderStatus.UNKNOWN:
      return 'Genre: Inconnu'
    case GenderStatus.OTHER_UNKNOWN:
      return 'Genre: Autre'
    default:
      return null
  }
}

export const vitalStatusName = (vitalStatus: VitalStatus | null): string | null => {
  switch (vitalStatus) {
    case VitalStatus.ALIVE:
      return 'Patients vivants'
    case VitalStatus.DECEASED:
      return 'Patients décédés'
    default:
      return null
  }
}

export const getLastDiagnosisLabels = (mainDiagnosisList: Condition[]) => {
  const mainDiagnosisLabels = mainDiagnosisList.map((diagnosis) => diagnosis.code?.coding?.[0].display)
  const lastThreeDiagnosisLabels = mainDiagnosisLabels
    .filter((diagnosis, index) => mainDiagnosisLabels.indexOf(diagnosis) === index)
    .slice(0, 3)
    .join(' - ')

  return lastThreeDiagnosisLabels
}
