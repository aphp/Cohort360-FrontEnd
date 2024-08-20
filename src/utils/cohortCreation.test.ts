import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { checkNominativeCriteria } from './cohortCreation'

describe('test of checkNominativeCriteria', () => {
  it('should return false if selectedCriteria is an empty table', () => {
    const selectedCriteria: SelectedCriteriaType[] = []
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contain a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        error: undefined,
        type: CriteriaType.PROCEDURE,
        encounterService: undefined,
        isInclusive: true,
        title: 'Procedure',
        occurrence: null,
        occurrenceComparator: null,
        startOccurrence: ['2024-08-15', '2024-08-22'],
        endOccurrence: undefined,
        encounterStartDate: ['2024-08-07', '2024-08-21'],
        includeEncounterStartDateNull: true,
        encounterEndDate: ['2024-08-22', '2024-08-22'],
        includeEncounterEndDateNull: true,
        encounterStatus: [
          {
            id: 'cancelled',
            label: 'Cancelled',
            system: 'http://hl7.org/fhir/CodeSystem/encounter-status'
          }
        ],
        hierarchy: undefined,
        code: [
          {
            id: 'salut',
            label: 'salut'
          }
        ],
        source: null,
        label: undefined
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: [null, null],
        birthdates: [null, null],
        deathDates: [null, null]
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: ['0/2/12', '0/5/15'],
        birthdates: [null, null],
        deathDates: [null, null]
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: ['7/2/12', '0/5/15'],
        birthdates: [null, null],
        deathDates: [null, null]
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: ['0/2/12', '8/5/15'],
        birthdates: [null, null],
        deathDates: [null, null]
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: [null, null],
        birthdates: ['2024-08-15', '2024-08-15'],
        deathDates: [null, null]
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: [null, null],
        birthdates: [null, null],
        deathDates: ['2024-08-15', '2024-08-15']
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = [
      {
        id: 1,
        error: undefined,
        type: CriteriaType.PROCEDURE,
        encounterService: undefined,
        isInclusive: true,
        title: 'Procedure',
        occurrence: null,
        occurrenceComparator: null,
        startOccurrence: ['2024-08-15', '2024-08-22'],
        endOccurrence: undefined,
        encounterStartDate: ['2024-08-07', '2024-08-21'],
        includeEncounterStartDateNull: true,
        encounterEndDate: ['2024-08-22', '2024-08-22'],
        includeEncounterEndDateNull: true,
        encounterStatus: [
          {
            id: 'cancelled',
            label: 'Cancelled',
            system: 'http://hl7.org/fhir/CodeSystem/encounter-status'
          }
        ],
        hierarchy: undefined,
        code: [
          {
            id: 'salut',
            label: 'salut'
          }
        ],
        source: null,
        label: undefined
      },
      {
        id: 1,
        title: 'Patient',
        type: CriteriaType.PATIENT,
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
        age: [null, null],
        birthdates: [null, null],
        deathDates: ['2024-08-15', '2024-08-15']
      }
    ]
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
})
