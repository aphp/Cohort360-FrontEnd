import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'

vi.mock('services/aphp/callApi', () => ({
  fetchPatient: vi.fn(),
  fetchEncounter: vi.fn(),
  fetchDocumentReferenceContent: vi.fn(),
  fetchBinary: vi.fn(),
  fetchCheckDocumentSearchInput: vi.fn(),
  fetchCohortInfo: vi.fn(),
  fetchCohortAccesses: vi.fn()
}))

vi.mock('utils/graphUtils', () => ({
  getGenderRepartitionMapAphp: vi.fn(),
  getEncounterRepartitionMapAphp: vi.fn(),
  getAgeRepartitionMapAphp: vi.fn(),
  getVisitRepartitionMapAphp: vi.fn()
}))

vi.mock('utils/apiHelpers', () => ({
  getApiResponseResource: vi.fn((r) => r?.data),
  getApiResponseResources: vi.fn((r) => r?.data?.resources ?? [])
}))

import {
  fetchCheckDocumentSearchInput,
  fetchBinary,
  fetchDocumentReferenceContent,
  fetchCohortAccesses
} from 'services/aphp/callApi'
import servicesCohorts from 'services/aphp/serviceCohorts'

const mockCheck = vi.mocked(fetchCheckDocumentSearchInput)
const mockBinary = vi.mocked(fetchBinary)
const mockDocContent = vi.mocked(fetchDocumentReferenceContent)
const mockCohortAccesses = vi.mocked(fetchCohortAccesses)

const asAxios = <T,>(data: T): AxiosResponse<T> =>
  ({ data, status: 200, statusText: '', headers: {}, config: {} }) as AxiosResponse<T>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('serviceCohorts.checkDocumentSearchInput', () => {
  it('retourne isError=false pour une entrée vide', async () => {
    const result = await servicesCohorts.checkDocumentSearchInput('')
    expect(result).toEqual({ isError: false })
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it('retourne une erreur serveur quand la réponse est nulle', async () => {
    mockCheck.mockResolvedValue(null as never)
    const result = await servicesCohorts.checkDocumentSearchInput('recherche')
    expect(result.isError).toBe(true)
    expect(result.errorsDetails?.[0].errorName).toBe('Erreur du serveur')
  })

  it('isError=false quand un paramètre VALIDÉ est présent', async () => {
    mockCheck.mockResolvedValue([{ name: 'VALIDÉ' }] as never)
    const result = await servicesCohorts.checkDocumentSearchInput('ok')
    expect(result.isError).toBe(false)
    expect(result.errorsDetails).toEqual([])
  })

  it('parse les positions et la solution depuis un WARNING', async () => {
    mockCheck.mockResolvedValue([
      {
        name: 'WARNING',
        part: [
          {
            name: 'syntaxError',
            valueString: 'Message; Positions: char:3 char:7; Solution: reformuler'
          }
        ]
      }
    ] as never)
    const result = await servicesCohorts.checkDocumentSearchInput('bad query')
    expect(result.isError).toBe(true) // pas de VALIDÉ
    expect(result.errorsDetails).toHaveLength(1)
    expect(result.errorsDetails?.[0]).toEqual({
      errorName: 'syntaxError',
      errorPositions: [3, 7],
      errorSolution: 'reformuler'
    })
  })

  it('ignore les entrées WARNING sans valueString', async () => {
    mockCheck.mockResolvedValue([{ name: 'WARNING', part: [{ name: 'x' }] }] as never)
    const result = await servicesCohorts.checkDocumentSearchInput('q')
    expect(result.errorsDetails).toEqual([])
  })
})

describe('serviceCohorts.fetchCohortsRights', () => {
  it('retourne les cohortes inchangées quand aucun group_id valide', async () => {
    const cohorts = [{ group_id: '' }] as never
    const result = await servicesCohorts.fetchCohortsRights(cohorts)
    expect(result).toEqual(cohorts)
    expect(mockCohortAccesses).not.toHaveBeenCalled()
  })

  it('associe les droits par group_id (nominal)', async () => {
    mockCohortAccesses.mockResolvedValue(
      asAxios([{ cohort_id: 'g1', rights: { read_patient_nomi: true } }])
    )
    const cohorts = [{ group_id: 'g1' }, { group_id: 'g2' }] as never
    const result = await servicesCohorts.fetchCohortsRights(cohorts)
    expect(result[0].rights).toEqual({ read_patient_nomi: true })
    expect(result[1].rights).toBeUndefined()
  })

  it('retourne [] en cas d’erreur API', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCohortAccesses.mockRejectedValue(new Error('boom'))
    const result = await servicesCohorts.fetchCohortsRights([{ group_id: 'g1' }] as never)
    expect(result).toEqual([])
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('serviceCohorts.fetchDocumentContent / fetchBinary', () => {
  it('fetchDocumentContent délègue à getApiResponseResource', async () => {
    mockDocContent.mockResolvedValue({ data: { resourceType: 'DocumentReference', id: 'd1' } } as never)
    const result = await servicesCohorts.fetchDocumentContent('comp-1')
    expect(result).toEqual({ resourceType: 'DocumentReference', id: 'd1' })
  })

  it('fetchBinary retourne le premier binaire disponible', async () => {
    mockBinary.mockResolvedValue({ data: { resources: [{ resourceType: 'Binary', id: 'b1' }] } } as never)
    const result = await servicesCohorts.fetchBinary('doc-1')
    expect(result).toEqual({ resourceType: 'Binary', id: 'b1' })
  })

  it('fetchBinary retourne undefined quand aucun binaire', async () => {
    mockBinary.mockResolvedValue({ data: { resources: [] } } as never)
    expect(await servicesCohorts.fetchBinary('doc-1')).toBeUndefined()
  })
})
