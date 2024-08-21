import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

const defaultProcedureCriteria: SelectedCriteriaType = {
  id: 1,
  error: undefined,
  type: CriteriaType.PROCEDURE,
  encounterService: undefined,
  isInclusive: true,
  title: 'Procedure',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: undefined,
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: true,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: true,
  encounterStatus: [],
  hierarchy: undefined,
  code: [],
  source: null,
  label: undefined
}

const defaultPatientCriteria: SelectedCriteriaType = {
  id: 1,
  title: 'Patient',
  type: CriteriaType.PATIENT,
  genders: [],
  vitalStatus: [],
  age: [null, null],
  birthdates: [null, null],
  deathDates: [null, null]
}

const defaultEncounterCriteria: SelectedCriteriaType = {
  id: 1,
  type: CriteriaType.ENCOUNTER,
  isInclusive: true,
  title: 'critere encouter',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: false,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: false,
  encounterStatus: [],
  age: [null, null],
  duration: [null, null],
  admissionMode: null,
  entryMode: null,
  exitMode: null,
  priseEnChargeType: null,
  typeDeSejour: null,
  reason: null,
  destination: null,
  provenance: null,
  admission: null,
  encounterService: undefined
}

const defaultIPPCriteria: SelectedCriteriaType = {
  id: 1,
  type: CriteriaType.IPP_LIST,
  isInclusive: true,
  title: 'critere IPP',
  search: ''
}

export const checkNominativeCriteria1: SelectedCriteriaType[] = [
  {
    ...defaultProcedureCriteria,
    startOccurrence: ['2024-08-15', '2024-08-22'],
    encounterStartDate: ['2024-08-07', '2024-08-21'],
    encounterStatus: [
      {
        id: 'cancelled',
        label: 'Cancelled',
        system: 'http://hl7.org/fhir/CodeSystem/encounter-status'
      }
    ],
    encounterEndDate: ['2024-08-22', '2024-08-22'],
    code: [
      {
        id: 'salut',
        label: 'salut'
      }
    ]
  }
]

export const checkNominativeCriteria2: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    genders: [
      {
        id: 'f',
        label: 'Femme'
      }
    ],
    vitalStatus: [
      {
        id: 'alive',
        label: 'Vivant'
      }
    ]
  }
]

export const checkNominativeCriteria3: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: ['0/2/12', '0/5/15']
  }
]

export const checkNominativeCriteria4: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: ['7/2/12', '0/5/15']
  }
]

export const checkNominativeCriteria5: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: ['0/2/12', '8/5/15']
  }
]

export const checkNominativeCriteria6: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    birthdates: ['2024-08-15', '2024-08-15']
  }
]

export const checkNominativeCriteria7: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    deathDates: ['2024-08-15', '2024-08-15']
  }
]

export const checkNominativeCriteria8: SelectedCriteriaType[] = [
  ...checkNominativeCriteria1,
  {
    ...defaultPatientCriteria,
    genders: [
      {
        id: 'f',
        label: 'Femme'
      }
    ],
    vitalStatus: [
      {
        id: 'alive',
        label: 'Vivant'
      }
    ],
    deathDates: ['2024-08-15', '2024-08-15']
  }
]

export const checkNominativeCriteria9: SelectedCriteriaType[] = [
  ...checkNominativeCriteria1,
  {
    ...defaultPatientCriteria,
    genders: [
      {
        id: 'f',
        label: 'Femme'
      }
    ],
    vitalStatus: [
      {
        id: 'alive',
        label: 'Vivant'
      }
    ],
    age: ['0/1/2', '0/5/15']
  }
]

export const checkNominativeCriteria10: SelectedCriteriaType[] = [
  {
    ...defaultIPPCriteria,
    search: '800000000, 800000001,8514257145'
  }
]

export const checkNominativeCriteria11: SelectedCriteriaType[] = [
  {
    ...defaultIPPCriteria
  }
]

export const checkNominativeCriteria12: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria
  }
]

export const checkNominativeCriteria13: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria,
    age: ['0/1/2', '0/5/15']
  }
]

export const checkNominativeCriteria14: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria,
    age: ['2/1/2', '5/5/15']
  }
]
