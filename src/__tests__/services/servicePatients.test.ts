import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('services/aphp/callApi', () => ({
  fetchPatient: vi.fn(),
  fetchEncounter: vi.fn(),
  fetchCondition: vi.fn(),
  fetchProcedure: vi.fn(),
  fetchDocumentReference: vi.fn(),
  fetchQuestionnaires: vi.fn()
}))

vi.mock('utils/graphUtils', () => ({
  getGenderRepartitionMapAphp: vi.fn(),
  getEncounterRepartitionMapAphp: vi.fn(),
  getAgeRepartitionMapAphp: vi.fn(),
  getVisitRepartitionMapAphp: vi.fn()
}))

vi.mock('utils/apiHelpers', () => ({
  getApiResponseResources: vi.fn((r) => r?.data?.resources ?? [])
}))

vi.mock('services/aphp/servicePerimeters', () => ({
  default: { getPerimeters: vi.fn(), fetchPerimetersRights: vi.fn() }
}))

vi.mock('services/aphp/serviceCohorts', () => ({
  default: { fetchCohortsRights: vi.fn() }
}))

vi.mock('utils/fhir', () => ({
  getExtension: vi.fn()
}))

vi.mock('services/aphp/servicePmsi', () => ({ fetchLastPmsi: vi.fn() }))
vi.mock('.', () => ({ default: {} }))
vi.mock('utils/perimeters', () => ({ isCustomError: vi.fn(() => false) }))

import {
  fetchPatient,
  fetchProcedure,
  fetchCondition,
  fetchQuestionnaires,
  fetchDocumentReference
} from 'services/aphp/callApi'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import servicesCohorts from 'services/aphp/serviceCohorts'
import { getExtension } from 'utils/fhir'
import servicesPatients, { getEncounterDocuments } from 'services/aphp/servicePatients'

const mockFetchPatient = vi.mocked(fetchPatient)
const mockFetchProcedure = vi.mocked(fetchProcedure)
const mockFetchCondition = vi.mocked(fetchCondition)
const mockFetchQuestionnaires = vi.mocked(fetchQuestionnaires)
const mockFetchDocRef = vi.mocked(fetchDocumentReference)
const mockGetPerimeters = vi.mocked(servicesPerimeters.getPerimeters)
const mockFetchPerimRights = vi.mocked(servicesPerimeters.fetchPerimetersRights)
const mockCohortsRights = vi.mocked(servicesCohorts.fetchCohortsRights)
const mockGetExtension = vi.mocked(getExtension)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('servicePatients.fetchPatientsCount', () => {
  it('retourne le total du bundle (nominal)', async () => {
    mockFetchPatient.mockResolvedValue({ data: { resourceType: 'Bundle', total: 12 } } as never)
    expect(await servicesPatients.fetchPatientsCount()).toBe(12)
  })

  it('retourne null pour un OperationOutcome', async () => {
    mockFetchPatient.mockResolvedValue({ data: { resourceType: 'OperationOutcome' } } as never)
    expect(await servicesPatients.fetchPatientsCount()).toBeNull()
  })

  it('retourne 0 quand total est absent', async () => {
    mockFetchPatient.mockResolvedValue({ data: { resourceType: 'Bundle' } } as never)
    expect(await servicesPatients.fetchPatientsCount()).toBe(0)
  })

  it('retourne null en cas d’erreur', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchPatient.mockRejectedValue(new Error('boom'))
    expect(await servicesPatients.fetchPatientsCount()).toBeNull()
    spy.mockRestore()
  })
})

describe('servicePatients.fetchAllProcedures / fetchAllConditions', () => {
  it('fetchAllProcedures retourne les ressources', async () => {
    mockFetchProcedure.mockResolvedValue({ data: { resources: [{ resourceType: 'Procedure', id: 'p1' }] } } as never)
    const result = await servicesPatients.fetchAllProcedures('patient-1', 'group-1', 100)
    expect(result).toEqual([{ resourceType: 'Procedure', id: 'p1' }])
    expect(mockFetchProcedure).toHaveBeenCalledWith(expect.objectContaining({ subject: 'patient-1', _list: ['group-1'] }))
  })

  it('fetchAllProcedures retourne [] quand aucune ressource', async () => {
    mockFetchProcedure.mockResolvedValue({ data: {} } as never)
    expect(await servicesPatients.fetchAllProcedures('p', '', 10)).toEqual([])
  })

  it('fetchAllConditions retourne les ressources', async () => {
    mockFetchCondition.mockResolvedValue({ data: { resources: [{ resourceType: 'Condition', id: 'c1' }] } } as never)
    const result = await servicesPatients.fetchAllConditions('patient-1', undefined, 50)
    expect(result).toEqual([{ resourceType: 'Condition', id: 'c1' }])
    // groupId absent -> _list vide
    expect(mockFetchCondition).toHaveBeenCalledWith(expect.objectContaining({ _list: [] }))
  })
})

describe('servicePatients.fetchQuestionnaires', () => {
  it('retourne la liste des questionnaires', async () => {
    mockFetchQuestionnaires.mockResolvedValue({ data: { resources: [{ id: 'q1' }] } } as never)
    expect(await servicesPatients.fetchQuestionnaires()).toEqual([{ id: 'q1' }])
  })
})

describe('servicePatients.fetchRights', () => {
  it('utilise les périmètres quand ils existent (pseudo => true)', async () => {
    mockGetPerimeters.mockResolvedValue({ results: [{ id: '1' }], count: 1 } as never)
    mockFetchPerimRights.mockResolvedValue([{ id: '1' }] as never)
    mockGetExtension.mockReturnValue({ valueString: 'DATA_PSEUDOANONYMISED' } as never)
    expect(await servicesPatients.fetchRights('group-1')).toBe(true)
  })

  it('retombe sur les droits de cohorte quand aucun périmètre', async () => {
    mockGetPerimeters.mockResolvedValue({ results: [], count: 0 } as never)
    mockCohortsRights.mockResolvedValue([
      { rights: { read_patient_pseudo: true, read_patient_nomi: false } }
    ] as never)
    expect(await servicesPatients.fetchRights('group-1')).toBe(true)
  })

  it('retourne false quand la cohorte est nominative', async () => {
    mockGetPerimeters.mockResolvedValue({ results: [], count: 0 } as never)
    mockCohortsRights.mockResolvedValue([
      { rights: { read_patient_pseudo: true, read_patient_nomi: true } }
    ] as never)
    expect(await servicesPatients.fetchRights('group-1')).toBe(false)
  })
})

describe('servicePatients.getEncounterDocuments', () => {
  it('retourne undefined quand encounters est absent', async () => {
    expect(await getEncounterDocuments(undefined)).toBeUndefined()
  })

  it('retourne la liste inchangée quand elle est vide', async () => {
    expect(await getEncounterDocuments([])).toEqual([])
  })

  it('associe les documents aux encounters correspondants', async () => {
    mockFetchDocRef.mockResolvedValue({
      data: {
        resources: [
          { id: 'doc1', context: { encounter: [{ reference: 'Encounter/enc1' }] } }
        ]
      }
    } as never)
    const encounters = [{ id: 'enc1' }, { id: 'enc2' }] as never
    const result = await getEncounterDocuments(encounters, undefined, 'group-1')
    expect(result?.[0].documents).toHaveLength(1)
    expect(result?.[1].documents).toHaveLength(0)
  })
})
