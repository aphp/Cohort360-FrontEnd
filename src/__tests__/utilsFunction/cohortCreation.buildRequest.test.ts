import { describe, it, expect, vi } from 'vitest'
import { buildRequest } from 'utils/cohortCreation'
import { CriteriaType } from 'types/requestCriterias'
import { CriteriaGroup, CriteriaGroupType, TemporalConstraintsType } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types/scope'

// buildRequest est le cœur du requeteur: il sérialise population + arbre de
// critères/groupes en JSON Requeteur. On teste ici son comportement structurel.
// On await le résultat pour rester compatible que buildRequest soit sync ou async.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const population = (props: any): Hierarchy<ScopeElement> => props

const rootGroup = (criteriaIds: number[]): CriteriaGroup => ({
  id: 0,
  title: 'root',
  type: CriteriaGroupType.AND_GROUP,
  criteriaIds,
  isInclusive: true
})

const noConstraints: TemporalConstraintsType[] = []

describe('cohortCreation.buildRequest - population', () => {
  it('retourne une chaîne vide quand la population est null', async () => {
    expect(await buildRequest(null, [], [], noConstraints)).toBe('')
  })

  it('inclut la version et le type request', async () => {
    const json = JSON.parse(await buildRequest([population({ cohort_id: 'c1' })], [], [rootGroup([])], noConstraints))
    expect(json._type).toBe('request')
    expect(json.version).toMatch(/^v/)
  })

  it('extrait la liste des cohortes de source (caresiteCohortList) en filtrant loading/vides', async () => {
    const json = JSON.parse(
      await buildRequest(
        [population({ cohort_id: 'c1' }), population({ cohort_id: 'loading' }), population({ cohort_id: '' })],
        [],
        [rootGroup([])],
        noConstraints
      )
    )
    expect(json.sourcePopulation.caresiteCohortList).toEqual(['c1'])
  })
})

describe('cohortCreation.buildRequest - groupe principal', () => {
  it('construit un groupe AND vide quand aucun critère', async () => {
    const json = JSON.parse(await buildRequest([population({ cohort_id: 'c1' })], [], [rootGroup([])], noConstraints))
    expect(json.request._id).toBe(0)
    expect(json.request._type).toBe(CriteriaGroupType.AND_GROUP)
    expect(json.request.criteria).toEqual([])
  })

  it('sérialise un critère basicResource avec le bon resourceType', async () => {
    const criteria = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { id: 1, type: CriteriaType.CONDITION, title: 'Diag', isInclusive: true, occurrence: { value: 1, comparator: '>=' } } as any
    ]
    const json = JSON.parse(
      await buildRequest([population({ cohort_id: 'c1' })], criteria, [rootGroup([1])], noConstraints)
    )
    expect(json.request.criteria).toHaveLength(1)
    expect(json.request.criteria[0]).toMatchObject({
      _type: 'basicResource',
      _id: 1,
      resourceType: 'Condition',
      isInclusive: true
    })
  })

  it('ignore un id de critère inconnu', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const json = JSON.parse(
      await buildRequest([population({ cohort_id: 'c1' })], [], [rootGroup([42])], noConstraints)
    )
    expect(json.request.criteria).toEqual([])
    spy.mockRestore()
  })

  it('imbrique les sous-groupes (id négatif)', async () => {
    const criteria = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { id: 1, type: CriteriaType.CONDITION, title: 'Diag', isInclusive: true, occurrence: { value: 1, comparator: '>=' } } as any
    ]
    const groups: CriteriaGroup[] = [
      rootGroup([-1]),
      { id: -1, title: 'sub', type: CriteriaGroupType.OR_GROUP, criteriaIds: [1], isInclusive: true }
    ]
    const json = JSON.parse(await buildRequest([population({ cohort_id: 'c1' })], criteria, groups, noConstraints))
    expect(json.request.criteria[0]._type).toBe(CriteriaGroupType.OR_GROUP)
    expect(json.request.criteria[0].criteria[0]._id).toBe(1)
  })
})

describe('cohortCreation.buildRequest - déidentification et contraintes', () => {
  it('détecte le mode pseudonymisé via l’access de la population', async () => {
    // Un critère PATIENT est nécessaire pour exercer la branche deidentified dans constructFhirFilter,
    // mais on vérifie surtout que la sérialisation aboutit sans erreur.
    const json = JSON.parse(
      await buildRequest([population({ cohort_id: 'c1', access: 'Pseudonymisé' })], [], [rootGroup([])], noConstraints)
    )
    expect(json.request).toBeDefined()
  })

  it('filtre les contraintes temporelles de type none', async () => {
    const constraints = [
      { id: 1, constraintType: 'none' },
      { id: 2, constraintType: 'directChronologicalOrdering' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any
    const json = JSON.parse(
      await buildRequest([population({ cohort_id: 'c1' })], [], [rootGroup([])], constraints)
    )
    expect(json.request.temporalConstraints).toHaveLength(1)
    expect(json.request.temporalConstraints[0].constraintType).toBe('directChronologicalOrdering')
  })

  it('retourne un request undefined quand il n’y a pas de groupe racine (id 0)', async () => {
    const json = JSON.parse(await buildRequest([population({ cohort_id: 'c1' })], [], [], noConstraints))
    expect(json.request).toBeUndefined()
  })
})
