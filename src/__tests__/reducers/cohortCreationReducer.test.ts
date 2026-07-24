import { describe, it, expect, vi } from 'vitest'
import { CriteriaGroupType, JobStatus } from 'types'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      system: { fhirUrl: 'http://localhost/fhir', backendUrl: 'http://localhost/back' },
      features: { cohort: { shortCohortLimit: 20000 } }
    }))
  }
})

// On isole le slice des thunks lourds et des dépendances services en mockant
// les modules important des thunks. On ne teste ici que les reducers synchrones.
vi.mock('services/aphp', () => ({ default: {} }))
vi.mock('services/aphp/serviceCohortCreation', () => ({ default: {} }))
vi.mock('utils/cohortCreation', () => ({
  buildRequest: vi.fn(() => '{}'),
  unbuildRequest: vi.fn(),
  joinRequest: vi.fn()
}))

import reducer, {
  setCohortName,
  setPopulationSource,
  setSelectedCriteria,
  addNewSelectedCriteria,
  addNewCriteriaGroup,
  editAllCriteria,
  editAllCriteriaGroup,
  pseudonimizeCriteria,
  editSelectedCriteria,
  editCriteriaGroup,
  deleteSelectedCriteria,
  duplicateSelectedCriteria,
  updateTemporalConstraints,
  deleteTemporalConstraint,
  suspendCount,
  unsuspendCount,
  updateCount,
  editDiagramViewMode,
  editJson,
  editSnapshotHistory,
  addActionToNavHistory,
  resetCohortCreation
} from 'state/cohortCreation'

const init = () => reducer(undefined, { type: '@@INIT' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const crit = (id: number, type: CriteriaType = CriteriaType.CONDITION): SelectedCriteriaType =>
  ({ id, type, title: `crit-${id}`, isInclusive: true }) as never

describe('cohortCreation slice - état initial', () => {
  it('contient le groupe racine et une contrainte NONE', () => {
    const state = init()
    expect(state.criteriaGroup[0].id).toBe(0)
    expect(state.selectedCriteria).toEqual([])
    expect(state.nextCriteriaId).toBe(1)
    expect(state.nextGroupId).toBe(-1)
    expect(state.temporalConstraints[0].constraintType).toBe('none')
  })
})

describe('cohortCreation slice - setters simples', () => {
  it('setCohortName', () => {
    expect(reducer(init(), setCohortName('Ma cohorte')).cohortName).toBe('Ma cohorte')
  })
  it('setPopulationSource', () => {
    const pop = [{ id: 'p1' }] as never
    expect(reducer(init(), setPopulationSource(pop)).selectedPopulation).toEqual(pop)
  })
  it('setSelectedCriteria', () => {
    const state = reducer(init(), setSelectedCriteria([crit(1)]))
    expect(state.selectedCriteria).toHaveLength(1)
  })
  it('editDiagramViewMode et editJson', () => {
    expect(reducer(init(), editDiagramViewMode('json')).viewMode).toBe('json')
    expect(reducer(init(), editJson('{"a":1}')).json).toBe('{"a":1}')
  })
  it('pseudonimizeCriteria passe isCriteriaNominative à false', () => {
    const dirty = { ...init(), isCriteriaNominative: true }
    expect(reducer(dirty, pseudonimizeCriteria()).isCriteriaNominative).toBe(false)
  })
})

describe('cohortCreation slice - ajout de critères et groupes', () => {
  it('addNewSelectedCriteria incrémente nextCriteriaId', () => {
    const state = reducer(init(), addNewSelectedCriteria(crit(1)))
    expect(state.selectedCriteria).toHaveLength(1)
    expect(state.nextCriteriaId).toBe(2)
  })

  it('addNewCriteriaGroup décrémente nextGroupId', () => {
    const group = { id: -1, title: 'g', type: CriteriaGroupType.AND_GROUP, criteriaIds: [], isInclusive: true }
    const state = reducer(init(), addNewCriteriaGroup(group))
    expect(state.criteriaGroup).toHaveLength(2)
    expect(state.nextGroupId).toBe(-2)
  })

  it('editAllCriteria et editAllCriteriaGroup remplacent les tableaux', () => {
    const s1 = reducer(init(), editAllCriteria([crit(1), crit(2)]))
    expect(s1.selectedCriteria).toHaveLength(2)
    const groups = [{ id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1], isInclusive: true }]
    const s2 = reducer(init(), editAllCriteriaGroup(groups))
    expect(s2.criteriaGroup[0].criteriaIds).toEqual([1])
  })
})

describe('cohortCreation slice - édition par id', () => {
  it('editSelectedCriteria remplace le critère correspondant', () => {
    const base = reducer(init(), setSelectedCriteria([crit(1), crit(2)]))
    const updated = { ...crit(2), title: 'modifié' }
    const state = reducer(base, editSelectedCriteria(updated))
    expect(state.selectedCriteria.find((c) => c.id === 2)?.title).toBe('modifié')
  })

  it('editSelectedCriteria ignore un id inexistant', () => {
    const base = reducer(init(), setSelectedCriteria([crit(1)]))
    const state = reducer(base, editSelectedCriteria(crit(99)))
    expect(state.selectedCriteria).toHaveLength(1)
  })

  it('editCriteriaGroup remplace le groupe correspondant', () => {
    const updated = { id: 0, title: 'root renommé', type: CriteriaGroupType.OR_GROUP, criteriaIds: [], isInclusive: true }
    const state = reducer(init(), editCriteriaGroup(updated))
    expect(state.criteriaGroup[0].title).toBe('root renommé')
    expect(state.criteriaGroup[0].type).toBe(CriteriaGroupType.OR_GROUP)
  })
})

describe('cohortCreation slice - suppression et duplication', () => {
  it('deleteSelectedCriteria retire le critère et réindexe', () => {
    let state = init()
    state = reducer(state, setSelectedCriteria([crit(1), crit(2)]))
    state = reducer(state, editAllCriteriaGroup([
      { id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1, 2], isInclusive: true }
    ]))
    const result = reducer(state, deleteSelectedCriteria(1))
    // un critère supprimé => il en reste un
    expect(result.selectedCriteria).toHaveLength(1)
  })

  it('duplicateSelectedCriteria ajoute une copie et réassigne les ids', () => {
    let state = init()
    state = reducer(state, setSelectedCriteria([crit(1)]))
    state = reducer(state, editAllCriteriaGroup([
      { id: 0, title: 'root', type: CriteriaGroupType.AND_GROUP, criteriaIds: [1], isInclusive: true }
    ]))
    const result = reducer(state, duplicateSelectedCriteria(1))
    expect(result.selectedCriteria).toHaveLength(2)
    // ids réassignés séquentiellement
    expect(result.selectedCriteria.map((c) => c.id)).toEqual([1, 2])
  })

  it('duplicateSelectedCriteria ne fait rien pour un id inexistant', () => {
    const base = reducer(init(), setSelectedCriteria([crit(1)]))
    const result = reducer(base, duplicateSelectedCriteria(99))
    expect(result.selectedCriteria).toHaveLength(1)
  })
})

describe('cohortCreation slice - contraintes temporelles', () => {
  it('updateTemporalConstraints remplace la liste', () => {
    const constraints = [{ idList: ['All'], constraintType: 'partialConstraint' }] as never
    expect(reducer(init(), updateTemporalConstraints(constraints)).temporalConstraints).toEqual(constraints)
  })

  it('deleteTemporalConstraint filtre par identité référentielle (objet distinct conservé)', () => {
    const c1 = { idList: ['All'], constraintType: 'none' } as never
    const c2 = { idList: [1, 2], constraintType: 'partialConstraint' } as never
    const base = reducer(init(), updateTemporalConstraints([c1, c2]))
    // Le reducer compare par référence (constraint !== payload). Un objet recréé
    // à l'identique n'est donc pas supprimé: la liste reste inchangée.
    const result = reducer(base, deleteTemporalConstraint({ idList: [1, 2], constraintType: 'partialConstraint' } as never))
    expect(result.temporalConstraints).toHaveLength(2)
  })
})

describe('cohortCreation slice - count', () => {
  it('suspendCount passe PENDING à SUSPENDED', () => {
    const base = { ...init(), count: { status: JobStatus.PENDING } }
    expect(reducer(base, suspendCount()).count.status).toBe(JobStatus.SUSPENDED)
  })

  it('suspendCount ne change pas un status non suspendable', () => {
    const base = { ...init(), count: { status: JobStatus.FINISHED } }
    expect(reducer(base, suspendCount()).count.status).toBe(JobStatus.FINISHED)
  })

  it('unsuspendCount repasse à PENDING', () => {
    const base = { ...init(), count: { status: JobStatus.SUSPENDED } }
    expect(reducer(base, unsuspendCount()).count.status).toBe(JobStatus.PENDING)
  })

  it('updateCount fusionne les champs de comptage', () => {
    const state = reducer(
      init(),
      updateCount({ status: JobStatus.FINISHED, includePatient: 42, snapshotId: 's1' } as never)
    )
    expect(state.count).toMatchObject({ status: JobStatus.FINISHED, includePatient: 42, snapshotId: 's1' })
  })
})

describe('cohortCreation slice - historique et reset', () => {
  it('editSnapshotHistory met à jour le snapshot et le currentSnapshot correspondant', () => {
    const base = {
      ...init(),
      snapshotsHistory: [{ uuid: 's1', name: 'ancien' }] as never,
      currentSnapshot: { uuid: 's1', name: 'ancien' } as never
    }
    const state = reducer(base, editSnapshotHistory({ uuid: 's1', name: 'nouveau' } as never))
    expect(state.snapshotsHistory[0].name).toBe('nouveau')
    expect(state.currentSnapshot.name).toBe('nouveau')
  })

  it('addActionToNavHistory empile un snapshot', () => {
    const state = reducer(init(), addActionToNavHistory({ navHistoryIndex: 0 } as never))
    expect(state.navHistory).toHaveLength(1)
  })

  it('resetCohortCreation restaure l’état initial', () => {
    const dirty = reducer(init(), setCohortName('x'))
    const state = reducer(dirty, resetCohortCreation())
    expect(state.cohortName).toBe('')
  })
})
