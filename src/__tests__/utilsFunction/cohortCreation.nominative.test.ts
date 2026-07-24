import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { CriteriaGroup, CriteriaGroupType } from 'types'

// On isole les fonctions testées des thunks/état Redux en mockant state/cohortCreation.
const editAllCriteria = vi.fn((p) => ({ type: 'editAllCriteria', payload: p }))
const editAllCriteriaGroup = vi.fn((p) => ({ type: 'editAllCriteriaGroup', payload: p }))
const pseudonimizeCriteria = vi.fn(() => ({ type: 'pseudonimizeCriteria' }))
const buildCohortCreation = vi.fn((p) => ({ type: 'buildCohortCreation', payload: p }))

vi.mock('state/cohortCreation', () => ({
  editAllCriteria: (p: unknown) => editAllCriteria(p),
  editAllCriteriaGroup: (p: unknown) => editAllCriteriaGroup(p),
  pseudonimizeCriteria: () => pseudonimizeCriteria(),
  buildCohortCreation: (p: unknown) => buildCohortCreation(p)
}))

import { checkNominativeCriteria, cleanNominativeCriterias } from 'utils/cohortCreation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const crit = (props: any): SelectedCriteriaType => props as SelectedCriteriaType

beforeEach(() => {
  vi.clearAllMocks()
})

describe('cohortCreation.checkNominativeCriteria', () => {
  it('retourne false pour des critères non nominatifs', () => {
    expect(
      checkNominativeCriteria([crit({ id: 1, type: CriteriaType.CONDITION })])
    ).toBe(false)
  })

  it('détecte un patient avec des dates de naissance', () => {
    expect(
      checkNominativeCriteria([
        crit({ id: 1, type: CriteriaType.PATIENT, birthdates: { start: '2000-01-01', end: null } })
      ])
    ).toBe(true)
  })

  it('détecte un patient avec des dates de décès', () => {
    expect(
      checkNominativeCriteria([
        crit({ id: 1, type: CriteriaType.PATIENT, birthdates: null, deathDates: { start: null, end: '2020-01-01' } })
      ])
    ).toBe(true)
  })

  it('détecte un âge exprimé en jours (précision fine)', () => {
    // le regex ^[^0/][^/]*\/.* matche une valeur comme "5/2/0" (années/mois/jours)
    expect(
      checkNominativeCriteria([crit({ id: 1, type: CriteriaType.ENCOUNTER, age: { start: '5/2/3', end: null } })])
    ).toBe(true)
  })

  it('détecte les critères sensibles (IPP, grossesse, hospitalisation)', () => {
    expect(checkNominativeCriteria([crit({ id: 1, type: CriteriaType.IPP_LIST })])).toBe(true)
    expect(checkNominativeCriteria([crit({ id: 1, type: CriteriaType.PREGNANCY })])).toBe(true)
    expect(checkNominativeCriteria([crit({ id: 1, type: CriteriaType.HOSPIT })])).toBe(true)
  })
})

describe('cohortCreation.cleanNominativeCriterias', () => {
  const dispatch = vi.fn() as never

  it('supprime les critères sensibles et anonymise patient/encounter', () => {
    const selectedCriteria = [
      crit({ id: 1, type: CriteriaType.IPP_LIST }),
      crit({
        id: 2,
        type: CriteriaType.PATIENT,
        birthdates: { start: '2000-01-01', end: null },
        deathDates: { start: '2020-01-01', end: null },
        age: { start: '5/2/3', end: '10/0/0', includeNull: true }
      }),
      crit({ id: 3, type: CriteriaType.ENCOUNTER, age: { start: '1/2/3', end: null, includeNull: false } }),
      crit({ id: 4, type: CriteriaType.CONDITION })
    ]
    const groups = [
      { id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2, 3, 4] }
    ] as CriteriaGroup[]

    cleanNominativeCriterias(selectedCriteria, groups, dispatch)

    // les critères nettoyés passés à editAllCriteria
    const cleaned = editAllCriteria.mock.calls[0][0] as SelectedCriteriaType[]
    // IPP_LIST supprimé
    expect(cleaned.map((c) => c.id)).toEqual([2, 3, 4])
    // patient: dates effacées, age anonymisé (année remplacée par 0)
    const patient = cleaned.find((c) => c.id === 2) as never as {
      birthdates: unknown
      deathDates: unknown
      age: { start: string | null; end: string | null }
    }
    expect(patient.birthdates).toBeNull()
    expect(patient.deathDates).toBeNull()
    expect(patient.age.start).toBe('0/2/3')
    // "10/0/0" -> "0/0/0" -> null
    expect(patient.age.end).toBeNull()
    // dispatch de la pseudonymisation et du rebuild
    expect(pseudonimizeCriteria).toHaveBeenCalled()
    expect(buildCohortCreation).toHaveBeenCalledWith({ selectedPopulation: null })
  })

  it('conserve selectedPopulation quand fourni', () => {
    cleanNominativeCriterias(
      [crit({ id: 1, type: CriteriaType.CONDITION })],
      [{ id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1] }],
      dispatch,
      [{ id: 'p1' }] as never
    )
    expect(buildCohortCreation).toHaveBeenCalledWith({ selectedPopulation: [{ id: 'p1' }] })
  })

  it('supprime les groupes vidés de leurs critères sensibles', () => {
    const selectedCriteria = [crit({ id: 1, type: CriteriaType.IPP_LIST }), crit({ id: 2, type: CriteriaType.CONDITION })]
    const groups = [
      { id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [-1, 2] },
      { id: -1, title: 'sub', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1] }
    ] as CriteriaGroup[]
    cleanNominativeCriterias(selectedCriteria, groups, dispatch)
    const cleanedGroups = editAllCriteriaGroup.mock.calls[0][0] as CriteriaGroup[]
    // le sous-groupe -1 ne contenait que le critère IPP supprimé -> retiré
    expect(cleanedGroups.some((g) => g.id === -1)).toBe(false)
  })
})
