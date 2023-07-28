import { GenderStatus, VitalStatus } from 'types'

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
