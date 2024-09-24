import {
  DemographicDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DemographicForm'

export const defaultPatientCriteria: DemographicDataType = {
  id: 1,
  ...form().initialData
}

export const patientGenderFemaleCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  genders: ['f']
}

export const patientGendersCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  genders: ['f', 'm']
}

export const patientDeceasedVitalStatusCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  vitalStatus: ['true']
}

export const patientVitalStatusCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  vitalStatus: ['true', 'false']
}

export const patientNominativeAgeCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  age: { start: '12/5/8', end: '25/7/25' }
}

export const patientNominativeBirthDatesCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  birthdates: { start: '2020-01-01', end: '2020-12-31' }
}

export const patientNominativeDeathDatesCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  deathDates: { start: '2020-01-01', end: '2020-12-31' }
}

export const completePatientCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  genders: ['f', 'm'],
  vitalStatus: ['true', 'false'],
  //age: { start: '12/5/8', end: '25/7/25' },
  birthdates: { start: '2020-01-01', end: '2020-12-31' },
  deathDates: { start: '2020-01-01', end: '2020-12-31' }
}
