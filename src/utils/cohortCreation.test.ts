import { SelectedCriteriaType } from 'types/requestCriterias'
import {
  checkNominativeCriteria1,
  checkNominativeCriteria10,
  checkNominativeCriteria11,
  checkNominativeCriteria12,
  checkNominativeCriteria13,
  checkNominativeCriteria14,
  checkNominativeCriteria2,
  checkNominativeCriteria3,
  checkNominativeCriteria4,
  checkNominativeCriteria5,
  checkNominativeCriteria6,
  checkNominativeCriteria7,
  checkNominativeCriteria8,
  checkNominativeCriteria9
} from '../__tests__/object/cohortCreation.'
import { checkNominativeCriteria } from './cohortCreation'

describe('test of checkNominativeCriteria', () => {
  it('should return false if selectedCriteria is an empty table', () => {
    const selectedCriteria: SelectedCriteriaType[] = []
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contain a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria1
    console.log('checkNominativeCriteria1', checkNominativeCriteria1[0])
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria2
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria3
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria4
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria5
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria6
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria7
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria8
    console.log('selectedCriteria', selectedCriteria[0], selectedCriteria[1])
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria9
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria10
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria11
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria12
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria13
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('', () => {
    const selectedCriteria: SelectedCriteriaType[] = checkNominativeCriteria14
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
})
