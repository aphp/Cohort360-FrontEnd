export enum MedicationType {
  Request = 'MedicationRequest',
  Administration = 'MedicationAdministration'
}

export enum MedicationTypeLabel {
  Request = 'Prescription',
  Administration = 'Administration'
}

export enum RequestCriteriasKeys {
  PATIENT = 'Patient',
  IPP_LIST = 'IPPList',
  ENCOUNTER = 'Encounter',
  DOCUMENTS = 'DocumentReference',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  CLAIM = 'Claim',
  MEDICATION_REQUEST = MedicationType.Request,
  MEDICATION_ADMINISTRATION = MedicationType.Administration,
  OBSERVATION = 'Observation'
}

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}
