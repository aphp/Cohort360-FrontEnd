export type PatientTypes = {
  groupId?: string
}

export enum PatientTableLabels {
  GENDER = 'Sexe',
  FIRSTNAME = 'Prénom',
  LASTNAME = 'Nom',
  BIRTHDATE = 'Date de naissance',
  AGE = 'Âge',
  LAST_ENCOUNTER = 'Dernier lieu de prise en charge',
  VITAL_STATUS = 'Statut vital',
  IPP = 'IPP'
}

export enum PMSI {
  DIAGNOSTIC = 'diagnostic',
  GHM = 'ghm',
  CCAM = 'ccam'
}

export enum PMSILabel {
  DIAGNOSTIC = 'Diagnostics CIM10',
  GHM = 'GHM',
  CCAM = 'Actes CCAM'
}

export enum Medication {
  PRESCRIPTION = 'prescription',
  ADMINISTRATION = 'administration'
}

export enum MedicationLabel {
  PRESCRIPTION = 'Prescription',
  ADMINISTRATION = 'Administration'
}
