export enum RequestCriteriasKeys {
  GENDERS = 'genders',
  VITAL_STATUS = 'vitalStatus',
  BIRTHDATES = 'birthdates',
  DEATH_DATES = 'deathDates',
  AGE = 'age'
}

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}

export enum MedicationType {
  Request = 'MedicationRequest',
  Administration = 'MedicationAdministration'
}

export enum MedicationTypeLabel {
  Request = 'Prescription',
  Administration = 'Administration'
}

export enum RequestCriteriasTypes {
  Request = 'MedicationRequest',
  Administration = 'MedicationAdministration',
  Documents = 'DocumentReference',
  IPPList = 'IPPList'
}
