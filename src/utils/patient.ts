import { PatientGenderKind, VitalStatus } from 'types'

export const genderName = (gender: PatientGenderKind): string => {
  switch (gender) {
    case PatientGenderKind._female:
      return 'Genre: Femmes'
    case PatientGenderKind._male:
      return 'Genre: Hommes'
    case PatientGenderKind._other:
      return 'Genre: Autre'
    case PatientGenderKind._unknown:
    default:
      return 'Genre: Inconnu'
  }
}

export const vitalStatusName = (vitalStatus: VitalStatus): string => {
  switch (vitalStatus) {
    case VitalStatus.alive:
      return 'Patients vivants'
    case VitalStatus.deceased:
      return 'Patients décédés'
    default:
      return 'Statut vital: Inconnu'
  }
}
