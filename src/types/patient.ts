export type PatientPMSITypes = {
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
