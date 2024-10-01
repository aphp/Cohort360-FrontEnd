import { Patient } from 'fhir/r4'
import { AgeRepartitionType, GenderRepartitionType } from 'types'

export enum PatientTableLabels {
  GENDER = 'Sexe',
  NAME = 'Prénom',
  LASTNAME = 'Nom',
  BIRTHDATE = 'Date de naissance',
  AGE = 'Âge',
  LAST_ENCOUNTER = 'Dernier lieu de prise en charge',
  VITAL_STATUS = 'Statut vital',
  IPP = 'IPP'
}

export enum PMSILabel {
  DIAGNOSTIC = 'Diagnostics CIM10',
  GHM = 'GHM',
  CCAM = 'Actes CCAM'
}

export type PatientsResponse = {
  totalPatients: number
  totalAllPatients: number
  originalPatients: Patient[] | undefined
  agePyramidData?: AgeRepartitionType
  genderRepartitionMap?: GenderRepartitionType
}
