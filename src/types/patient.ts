export type PatientTypes = {
  groupId?: string
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
