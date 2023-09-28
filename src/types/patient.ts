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
  GMH = 'ghm',
  CCAM = 'ccam'
}

export enum PMSILabel {
  DIAGNOSTIC = 'Diagnostics CIM10',
  GMH = 'GHM',
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

export enum PatientVitalStatus {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)'
}
