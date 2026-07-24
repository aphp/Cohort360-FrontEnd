import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CriteriaGroupType } from 'types'

// unbuildRequest dépend de services.perimeters.fetchPopulationForRequeteur et de
// la résolution des critères. On mocke la population et on teste avec des requêtes
// composées de groupes (sans basicResource) pour rester robuste et déterministe.
const fetchPopulationForRequeteur = vi.fn(async (..._args: any[]) => [{ id: 'p1', cohort_id: 'c1' }])

vi.mock('services/aphp', () => ({
  default: {
    perimeters: { fetchPopulationForRequeteur: (...args: any[]) => fetchPopulationForRequeteur(...args) }
  }
}))

import { unbuildRequest, joinRequest } from 'utils/cohortCreation'

const REQUETEUR_VERSION = 'v1.6.4'

const makeRequest = (requestGroup: unknown, caresiteCohortList: string[] = ['c1']) =>
  JSON.stringify({
    version: REQUETEUR_VERSION,
    _type: 'request',
    sourcePopulation: { caresiteCohortList },
    request: requestGroup
  })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('cohortCreation.unbuildRequest', () => {
  it('retourne un résultat vide pour une chaîne vide', async () => {
    const result = await unbuildRequest('')
    expect(result).toEqual({ population: null, criteria: [], criteriaGroup: [], idRemap: {} })
    expect(fetchPopulationForRequeteur).not.toHaveBeenCalled()
  })

  it('récupère la population mais renvoie des critères vides quand request est undefined', async () => {
    const result = await unbuildRequest(makeRequest(undefined))
    expect(fetchPopulationForRequeteur).toHaveBeenCalledWith(['c1'])
    expect(result.population).toEqual([{ id: 'p1', cohort_id: 'c1' }])
    expect(result.criteria).toEqual([])
    expect(result.criteriaGroup).toEqual([])
  })

  it('reconstruit un groupe racine vide', async () => {
    const result = await unbuildRequest(
      makeRequest({ _id: 0, _type: CriteriaGroupType.AND_GROUP, isInclusive: true, criteria: [] })
    )
    expect(result.criteriaGroup).toHaveLength(1)
    // le groupe racine reçoit l'id 0 (peut être -0 via index * -1)
    expect(Math.abs(result.criteriaGroup[0].id)).toBe(0)
    expect(result.criteria).toEqual([])
  })

  it('remappe les identifiants des contraintes temporelles', async () => {
    const result = await unbuildRequest(
      makeRequest({
        _id: 0,
        _type: CriteriaGroupType.AND_GROUP,
        isInclusive: true,
        criteria: [],
        temporalConstraints: [{ idList: ['All'], constraintType: 'none' }]
      })
    )
    expect(result.temporalConstraints).toBeDefined()
    expect(result.temporalConstraints?.[0].idList).toEqual(['All'])
  })

  it('reconstruit des sous-groupes imbriqués', async () => {
    const result = await unbuildRequest(
      makeRequest({
        _id: 0,
        _type: CriteriaGroupType.AND_GROUP,
        isInclusive: true,
        criteria: [{ _id: -1, _type: CriteriaGroupType.OR_GROUP, isInclusive: true, criteria: [] }]
      })
    )
    // groupe racine + sous-groupe
    expect(result.criteriaGroup.length).toBeGreaterThanOrEqual(2)
    const types = result.criteriaGroup.map((g) => g.type)
    expect(types).toContain(CriteriaGroupType.OR_GROUP)
  })
})

describe('cohortCreation.joinRequest', () => {
  it('fusionne la nouvelle requête dans le groupe parent ciblé', async () => {
    const oldJson = makeRequest({
      _id: 0,
      _type: CriteriaGroupType.AND_GROUP,
      isInclusive: true,
      criteria: []
    })
    const newJson = makeRequest({
      _id: 0,
      _type: CriteriaGroupType.OR_GROUP,
      isInclusive: true,
      criteria: []
    })
    const result = await joinRequest(oldJson, newJson, 0)
    // le résultat contient un JSON reconstruit et les structures de critères
    expect(typeof result.json).toBe('string')
    expect(Array.isArray(result.criteriaGroup)).toBe(true)
    // la fusion a ajouté un groupe supplémentaire issu de la nouvelle requête
    expect(result.criteriaGroup.length).toBeGreaterThanOrEqual(2)
  })

  it('produit un JSON parseable avec la version requeteur', async () => {
    const oldJson = makeRequest({ _id: 0, _type: CriteriaGroupType.AND_GROUP, isInclusive: true, criteria: [] })
    const newJson = makeRequest({ _id: 0, _type: CriteriaGroupType.AND_GROUP, isInclusive: true, criteria: [] })
    const result = await joinRequest(oldJson, newJson, 0)
    const parsed = JSON.parse(result.json)
    expect(parsed._type).toBe('request')
    expect(parsed.version).toMatch(/^v/)
  })
})
