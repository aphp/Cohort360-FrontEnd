import { PatientGenderKind, VitalStatus } from 'types'

export const genderName = (gender: PatientGenderKind | null): string | null => {
  switch (gender) {
    case PatientGenderKind._female:
      return 'Genre: Femmes'
    case PatientGenderKind._male:
      return 'Genre: Hommes'
    case PatientGenderKind._other:
      return 'Genre: Autre'
    case PatientGenderKind._unknown:
      return 'Genre: Inconnu'
    default:
      return null
  }
}

export const vitalStatusName = (vitalStatus: VitalStatus | null): string | null => {
  switch (vitalStatus) {
    case VitalStatus.alive:
      return 'Patients vivants'
    case VitalStatus.deceased:
      return 'Patients décédés'
    default:
      return null
  }
}
