import { SelectedCriteriaType } from 'types/requestCriterias'
import {
  procedurePeudonimizedCriteria,
  ippNominativeCriteria,
  ippEmptyCriteria,
  encounterPseudonimizedCriteria,
  encounterPseudoAgeCriteria,
  encounterNominativeAgeCriteria,
  patientPseudonimizedCriteria,
  patientPseudonimizedAgeCriteria,
  patientNominativeAge0Criteria,
  patientNominativeAge1Criteria,
  patientNominativeBirthdates,
  patientNominativeDeathDates,
  criteriasArrayWtihNominativeData,
  criteriaArrayWithNoNominativeData
} from '../__tests__/data/cohortCreation.'
import { checkNominativeCriteria } from './cohortCreation'

describe('test of checkNominativeCriteria', () => {
  it('should return false if selectedCriteria is an empty array', () => {
    const selectedCriteria: SelectedCriteriaType[] = []
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria contain procedure pseudonimized criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = procedurePeudonimizedCriteria
    console.log('procedurePeudonimizedCriteria', procedurePeudonimizedCriteria[0])
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria contain patient pseudonimized criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = patientPseudonimizedCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria contains patient.age pseudonimized", () => {
    const selectedCriteria: SelectedCriteriaType[] = patientPseudonimizedAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return true if selectedCriteria contain patient.age[0] nominative", () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeAge0Criteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return true if selectedCriteria contain patient.age[1] nominative", () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeAge1Criteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a patient birthdates', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeBirthdates
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a patient deathDates', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeDeathDates
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = criteriasArrayWtihNominativeData
    console.log('selectedCriteria', selectedCriteria[0], selectedCriteria[1])
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = criteriaArrayWithNoNominativeData
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contains a nominative IPP.search', () => {
    const selectedCriteria: SelectedCriteriaType[] = ippNominativeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains an IPP criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = ippEmptyCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return false if selectedCriteria contains an encounter pseudonimized criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterPseudonimizedCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return false if selectedCriteria contains a peudonimize encounter.age', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterPseudoAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contains a nominative encounter.age', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterNominativeAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
})
