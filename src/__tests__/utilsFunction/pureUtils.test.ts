import { describe, it, expect } from 'vitest'
import { getDocumentStatus } from 'utils/documentsFormatter'
import { getSelectableGroups } from 'utils/temporalConstraints'
import { safeJsonParse, formatAjvErrors } from 'utils/avjSchema/jsonValidation'
import { CriteriaGroup, CriteriaGroupType } from 'types'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

describe('documentsFormatter.getDocumentStatus', () => {
  it('mappe final vers "Validé"', () => {
    expect(getDocumentStatus('final')).toBe('Validé')
  })
  it('mappe preliminary vers "Non Validé"', () => {
    expect(getDocumentStatus('preliminary')).toBe('Non Validé')
  })
  it('retourne "Statut inconnu" pour undefined ou valeur inattendue', () => {
    expect(getDocumentStatus(undefined)).toBe('Statut inconnu')
    expect(getDocumentStatus('entered-in-error')).toBe('Statut inconnu')
  })
})

describe('jsonValidation.safeJsonParse', () => {
  it('parse un JSON valide', () => {
    const res = safeJsonParse('{"a":1}')
    expect(res.ok).toBe(true)
    expect(res.value).toEqual({ a: 1 })
    expect(res.error).toBeNull()
  })

  it('retourne une erreur pour un JSON invalide', () => {
    const res = safeJsonParse('{invalid}')
    expect(res.ok).toBe(false)
    expect(res.value).toBeNull()
    expect(typeof res.error).toBe('string')
  })
})

describe('jsonValidation.formatAjvErrors', () => {
  it('retourne [] pour une liste vide ou null', () => {
    expect(formatAjvErrors(null)).toEqual([])
    expect(formatAjvErrors([])).toEqual([])
    expect(formatAjvErrors(undefined)).toEqual([])
  })

  it('formate le premier message d’erreur avec le path et les params', () => {
    const result = formatAjvErrors([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { message: 'should be object', dataPath: '.foo', params: { type: 'object' } } as any
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('.foo')
    expect(result[0]).toContain('should be object')
    expect(result[0]).toContain('type')
  })
})

describe('temporalConstraints.getSelectableGroups', () => {
  const andGroup = (id: number, criteriaIds: number[]): CriteriaGroup => ({
    id,
    title: `G${id}`,
    criteriaIds,
    type: CriteriaGroupType.AND_GROUP
  })

  const criteria = (id: number, type: CriteriaType): SelectedCriteriaType =>
    ({ id, type }) as SelectedCriteriaType

  it('retourne les groupes AND ayant au moins 2 critères sélectionnables', () => {
    const selected = [
      criteria(1, CriteriaType.CONDITION),
      criteria(2, CriteriaType.PROCEDURE),
      criteria(3, CriteriaType.PATIENT)
    ]
    const groups = [andGroup(10, [1, 2, 3])]
    const result = getSelectableGroups(selected, groups)
    // le critère PATIENT (id 3) est exclu -> il reste 2 critères sélectionnables
    expect(result).toHaveLength(1)
    expect(result[0].criteriaIds).toEqual([1, 2])
  })

  it('exclut les groupes ayant moins de 2 critères sélectionnables', () => {
    const selected = [criteria(1, CriteriaType.CONDITION), criteria(2, CriteriaType.IPP_LIST)]
    const groups = [andGroup(10, [1, 2])]
    // IPP_LIST exclu -> 1 seul critère -> groupe non retenu
    expect(getSelectableGroups(selected, groups)).toHaveLength(0)
  })

  it('ignore les groupes qui ne sont pas de type AND', () => {
    const selected = [criteria(1, CriteriaType.CONDITION), criteria(2, CriteriaType.PROCEDURE)]
    const orGroup: CriteriaGroup = { id: 20, title: 'OR', criteriaIds: [1, 2], type: CriteriaGroupType.OR_GROUP }
    expect(getSelectableGroups(selected, [orGroup])).toHaveLength(0)
  })

  it('en mode épisode, ne retient que PREGNANCY et HOSPIT', () => {
    const selected = [
      criteria(1, CriteriaType.PREGNANCY),
      criteria(2, CriteriaType.HOSPIT),
      criteria(3, CriteriaType.CONDITION)
    ]
    const groups = [andGroup(10, [1, 2, 3])]
    const result = getSelectableGroups(selected, groups, true)
    expect(result[0].criteriaIds).toEqual([1, 2])
  })
})
