import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { VitalStatus } from 'types'

export const genderName = (gender: PatientGenderKind) => {
  switch (gender) {
    case PatientGenderKind._female:
      return 'Genre: Femmes'
    case PatientGenderKind._male:
      return 'Genre: Hommes'
    case PatientGenderKind._other:
      return 'Genre: Autre'
  }
}

export const vitalStatusName = (vitalStatus: VitalStatus) => {
  switch (vitalStatus) {
    case VitalStatus.alive:
      return 'Patients vivants'
    case VitalStatus.deceased:
      return 'Patients décédés'
  }
}
