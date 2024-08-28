import { CriteriaType, DemographicDataType } from 'types/requestCriterias'

export const defaultPatientCriteria: DemographicDataType = {
  id: 1,
  error: undefined,
  type: CriteriaType.PATIENT,
  encounterService: undefined,
  isInclusive: true,
  title: 'Demographic',
  genders: null,
  vitalStatus: null,
  age: [null, null],
  birthdates: [null, null],
  deathDates: [null, null]
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
  age: ['12/5/8', '25/7/25']
}

export const patientNominativeBirthDatesCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  birthdates: ['2020-01-01', '2020-12-31']
}

export const patientNominativeDeathDatesCriteria: DemographicDataType = {
  ...defaultPatientCriteria,
  deathDates: ['2020-01-01', '2020-12-31']
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
  age: ['12/5/8', '25/7/25'],
  birthdates: ['2020-01-01', '2020-12-31'],
  deathDates: ['2020-01-01', '2020-12-31']
}
