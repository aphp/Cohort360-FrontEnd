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
  genders: [
    {
      id: 'f',
      label: 'femme'
    }
  ]
}

export const patientGendersCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  genders: [
    {
      id: 'f',
      label: 'femme'
    },
    {
      id: 'm',
      label: 'homme'
    }
  ]
}

export const patientDeceasedVitalStatusCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  vitalStatus: [
    {
      id: 'true',
      label: 'deceased'
    }
  ]
}
export const patientVitalStatusCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  vitalStatus: [
    {
      id: 'true',
      label: 'deceased'
    },
    {
      id: 'false',
      label: 'alive'
    }
  ]
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
  genders: [
    {
      id: 'f',
      label: 'femme'
    },
    {
      id: 'm',
      label: 'homme'
    }
  ],
  vitalStatus: [
    {
      id: 'true',
      label: 'deceased'
    },
    {
      id: 'false',
      label: 'alive'
    }
  ],
  //age: { start: '12/5/8', end: '25/7/25' },
  birthdates: { start: '2020-01-01', end: '2020-12-31' },
  deathDates: { start: '2020-01-01', end: '2020-12-31' }
}
