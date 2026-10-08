import { describe, it, expect } from 'vitest'
import { getDocumentStatus } from 'utils/documentsFormatter'
import { getSelectableGroups } from 'utils/temporalConstraints'
import { safeJsonParse, formatAjvErrors, findUnavailableBiologyParam } from 'utils/avjSchema/jsonValidation'
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
      { message: 'should be object', instancePath: '.foo', params: { type: 'object' } } as any
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

  it('exclut les critères de Biologie des contraintes de même séjour', () => {
    const selected = [
      criteria(1, CriteriaType.CONDITION),
      criteria(2, CriteriaType.OBSERVATION),
      criteria(3, CriteriaType.PROCEDURE)
    ]
    const result = getSelectableGroups(selected, [andGroup(10, [1, 2, 3])])
    expect(result[0].criteriaIds).toEqual([1, 3])
  })

  it('ne retient pas un groupe dont la Biologie est le seul autre critère', () => {
    const selected = [criteria(1, CriteriaType.CONDITION), criteria(2, CriteriaType.OBSERVATION)]
    expect(getSelectableGroups(selected, [andGroup(10, [1, 2])])).toHaveLength(0)
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

describe('jsonValidation.findUnavailableBiologyParam', () => {
  const query = (resourceType: string, filterFhir: string) => ({
    _type: 'request',
    request: {
      _type: 'andGroup',
      criteria: [{ _type: 'basicResource', _id: 1, resourceType, filterFhir }]
    }
  })

  it('détecte un paramètre encounter.* sur un critère de Biologie', () => {
    expect(findUnavailableBiologyParam(query('Observation', 'code=A&encounter.status=finished'))).toBe(
      'encounter.status'
    )
  })

  it('détecte un paramètre encounter.* dans un _filter', () => {
    const filter = encodeURIComponent(
      '(encounter.period-start ge 2024-09-04T00:00:00Z) or not (encounter.period-start eq "*")'
    )
    expect(findUnavailableBiologyParam(query('Observation', `_filter=${filter}`))).toBe('encounter.period-start')
  })

  it('ignore les paramètres encounter.* des autres critères', () => {
    expect(findUnavailableBiologyParam(query('Condition', 'encounter.status=finished'))).toBeNull()
  })

  it('renvoie null pour un critère de Biologie sans paramètre encounter.*', () => {
    expect(findUnavailableBiologyParam(query('Observation', 'date=ge2024-01-01&date=le2024-02-01'))).toBeNull()
  })
})
