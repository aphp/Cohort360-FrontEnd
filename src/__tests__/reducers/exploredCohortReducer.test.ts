import { describe, it, expect } from 'vitest'
import { Patient } from 'fhir/r4'
import reducer, {
  addImportedPatients,
  removeImportedPatients,
  includePatients,
  excludePatients,
  removeExcludedPatients,
  updateCohort,
  resetState
} from 'state/exploredCohort'

// Note: on ne teste ici que les reducers purs (pas les thunks asynchrones qui
// dépendent des services APHP). Les reducers concentrent la logique métier de
// gestion des patients importés/inclus/exclus.

const patient = (id: string): Patient => ({ resourceType: 'Patient', id })

const baseState = () => reducer(undefined, { type: '@@INIT' })

describe('exploredCohort reducer - état initial', () => {
  it('retourne l’état par défaut', () => {
    const state = baseState()
    expect(state.importedPatients).toEqual([])
    expect(state.includedPatients).toEqual([])
    expect(state.excludedPatients).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.isSample).toBe(false)
  })
})

describe('exploredCohort reducer - addImportedPatients', () => {
  it('ajoute des patients importés', () => {
    const state = reducer(baseState(), addImportedPatients([patient('1'), patient('2')]))
    expect(state.importedPatients.map((p) => p.id)).toEqual(['1', '2'])
  })

  it('déduplique les patients ayant le même id', () => {
    const withOne = reducer(baseState(), addImportedPatients([patient('1')]))
    const state = reducer(withOne, addImportedPatients([patient('1'), patient('3')]))
    expect(state.importedPatients.map((p) => p.id)).toEqual(['1', '3'])
  })

  it('exclut les patients déjà présents dans originalPatients ou excludedPatients', () => {
    const seeded = reducer(baseState(), updateCohort({ originalPatients: [patient('1')] } as never))
    const withExcluded = { ...seeded, excludedPatients: [patient('2')] }
    const state = reducer(withExcluded, addImportedPatients([patient('1'), patient('2'), patient('3')]))
    expect(state.importedPatients.map((p) => p.id)).toEqual(['3'])
  })
})

describe('exploredCohort reducer - removeImportedPatients', () => {
  it('retire les patients importés indiqués', () => {
    const withImported = reducer(baseState(), addImportedPatients([patient('1'), patient('2'), patient('3')]))
    const state = reducer(withImported, removeImportedPatients([patient('2')]))
    expect(state.importedPatients.map((p) => p.id)).toEqual(['1', '3'])
  })
})

describe('exploredCohort reducer - includePatients', () => {
  it('déplace des patients depuis importés vers inclus', () => {
    const withImported = reducer(baseState(), addImportedPatients([patient('1'), patient('2')]))
    const state = reducer(withImported, includePatients([patient('1')]))
    expect(state.includedPatients.map((p) => p.id)).toEqual(['1'])
    expect(state.importedPatients.map((p) => p.id)).toEqual(['2'])
  })
})

describe('exploredCohort reducer - excludePatients', () => {
  it('déplace les originalPatients exclus vers excludedPatients', () => {
    const seeded = reducer(baseState(), updateCohort({ originalPatients: [patient('1'), patient('2')] } as never))
    const state = reducer(seeded, excludePatients([patient('1')]))
    expect(state.excludedPatients.map((p) => p.id)).toEqual(['1'])
    expect(state.originalPatients?.map((p) => p.id)).toEqual(['2'])
  })

  it('remet vers importés les patients qui étaient inclus', () => {
    const withImported = reducer(baseState(), addImportedPatients([patient('1'), patient('2')]))
    const withIncluded = reducer(withImported, includePatients([patient('1')]))
    const state = reducer(withIncluded, excludePatients([patient('1')]))
    expect(state.includedPatients.map((p) => p.id)).toEqual([])
    expect(state.importedPatients.map((p) => p.id)).toContain('1')
  })
})

describe('exploredCohort reducer - removeExcludedPatients', () => {
  it('remet les patients exclus dans originalPatients', () => {
    const seeded = reducer(baseState(), updateCohort({ originalPatients: [patient('2')] } as never))
    const withExcluded = { ...seeded, excludedPatients: [patient('1')] }
    const state = reducer(withExcluded, removeExcludedPatients([patient('1')]))
    expect(state.excludedPatients.map((p) => p.id)).toEqual([])
    expect(state.originalPatients?.map((p) => p.id)).toEqual(['2', '1'])
  })

  it('ne modifie pas l’état si payload est absent', () => {
    const withExcluded = { ...baseState(), excludedPatients: [patient('1')] }
    // @ts-expect-error test d'un payload invalide
    const state = reducer(withExcluded, removeExcludedPatients(undefined))
    expect(state.excludedPatients.map((p) => p.id)).toEqual(['1'])
  })
})

describe('exploredCohort reducer - updateCohort & resetState', () => {
  it('fusionne les données de cohorte', () => {
    const state = reducer(baseState(), updateCohort({ name: 'Ma cohorte', totalPatients: 42 } as never))
    expect(state.name).toBe('Ma cohorte')
    expect(state.totalPatients).toBe(42)
  })

  it('réinitialise l’état', () => {
    const dirty = reducer(baseState(), addImportedPatients([patient('1')]))
    const state = reducer(dirty, resetState())
    expect(state.importedPatients).toEqual([])
  })
})
