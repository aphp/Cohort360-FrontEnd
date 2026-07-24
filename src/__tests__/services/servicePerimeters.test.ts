import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'
import { ReadRightPerimeter } from 'types'
import { ScopeElement, SourceType, System, Rights } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'

// --- Mocks ---------------------------------------------------------------

vi.mock('services/aphp/callApi', () => ({
  fetchAccessExpirations: vi.fn(),
  fetchEncounter: vi.fn(),
  fetchPatient: vi.fn(),
  fetchPerimeterAccesses: vi.fn()
}))

vi.mock('../../services/apiBackend', () => ({
  default: { get: vi.fn() }
}))

vi.mock('utils/perimeters', () => ({
  scopeLevelsToRequestParam: vi.fn(() => 'ALL')
}))

vi.mock('utils/url', () => ({
  mapParamsToNetworkParams: (params: string[]) => (params.length ? `?${params.join('&')}` : '')
}))

vi.mock('utils/graphUtils', () => ({
  getAgeRepartitionMapAphp: vi.fn(),
  getEncounterRepartitionMapAphp: vi.fn(),
  getGenderRepartitionMapAphp: vi.fn(),
  getVisitRepartitionMapAphp: vi.fn()
}))

import { fetchAccessExpirations, fetchPerimeterAccesses } from 'services/aphp/callApi'
import apiBackend from '../../services/apiBackend'
import servicesPerimeters from 'services/aphp/servicePerimeters'

const mockFetchAccessExpirations = vi.mocked(fetchAccessExpirations)
const mockFetchPerimeterAccesses = vi.mocked(fetchPerimeterAccesses)
const mockApiBackendGet = vi.mocked(apiBackend.get)

// --- Fixtures ------------------------------------------------------------

const makeScopeElement = (overrides: Partial<ScopeElement> = {}): ScopeElement => ({
  id: '1',
  name: 'Hôpital A',
  source_value: 'H-A',
  type: 'Hospital',
  parent_id: '0',
  above_levels_ids: '',
  inferior_levels_ids: '',
  cohort_id: 'c1',
  cohort_size: '100',
  full_path: 'H-A',
  ...overrides
})

const makeReadRight = (overrides: Partial<ReadRightPerimeter> = {}): ReadRightPerimeter => ({
  perimeter: makeScopeElement(),
  read_role: 'READER',
  right_read_patient_nominative: false,
  right_read_patient_pseudonymized: true,
  right_search_patients_by_ipp: false,
  ...overrides
})

const asAxios = <T,>(data: T, status = 200): AxiosResponse<T> =>
  ({ data, status, statusText: 'OK', headers: {}, config: {} }) as AxiosResponse<T>

beforeEach(() => {
  vi.clearAllMocks()
})

// --- getAccessFromRights (pure logic, params invalides) ------------------

describe('servicePerimeters.getAccessFromRights', () => {
  it('retourne "Nominatif" quand read_access vaut DATA_NOMINATIVE', () => {
    const rights = makeReadRight({ read_access: 'DATA_NOMINATIVE' })
    expect(servicesPerimeters.getAccessFromRights(rights)).toBe('Nominatif')
  })

  it('retourne "Nominatif" quand right_read_patient_nominative est true', () => {
    const rights = makeReadRight({ right_read_patient_nominative: true })
    expect(servicesPerimeters.getAccessFromRights(rights)).toBe('Nominatif')
  })

  it('retourne "Pseudonymisé" par défaut sinon', () => {
    const rights = makeReadRight({ read_access: 'DATA_PSEUDOANONYMISED', right_read_patient_nominative: false })
    expect(servicesPerimeters.getAccessFromRights(rights)).toBe('Pseudonymisé')
  })
})

// --- mapRightsToScopeElement (entrées complètes) -------------------------

describe('servicePerimeters.mapRightsToScopeElement', () => {
  it('mappe un droit nominatif vers un ScopeElement avec accès "Nominatif"', () => {
    const item = makeReadRight({
      perimeter: makeScopeElement({ id: '42', source_value: 'H-42', name: 'Hôpital 42' }),
      right_read_patient_nominative: true
    })
    const result = servicesPerimeters.mapRightsToScopeElement(item)
    expect(result.id).toBe('42')
    expect(result.system).toBe(System.ScopeTree)
    expect(result.label).toBe('H-42 - Hôpital 42')
    expect(result.access).toBe('Nominatif')
    expect(result.rights?.read_access).toBe('DATA_NOMINATIVE')
    expect(result.rights?.export_access).toBe('DATA_PSEUDOANONYMISED')
  })

  it('mappe un droit pseudonymisé vers accès "Pseudonymisé"', () => {
    const item = makeReadRight({ right_read_patient_nominative: false })
    const result = servicesPerimeters.mapRightsToScopeElement(item)
    expect(result.access).toBe('Pseudonymisé')
    expect(result.rights?.read_access).toBe('DATA_PSEUDOANONYMISED')
  })
})

describe('servicePerimeters.mapPerimeterToScopeElement', () => {
  it('convertit un ScopeElement brut en Hierarchy avec label et system', () => {
    const item = makeScopeElement({ id: '7', source_value: 'S-7', name: 'Service 7' })
    const result = servicesPerimeters.mapPerimeterToScopeElement(item)
    expect(result.id).toBe('7')
    expect(result.label).toBe('S-7 - Service 7')
    expect(result.system).toBe(System.ScopeTree)
  })
})

// --- allowSearchIpp (nominal, params invalides) --------------------------

describe('servicePerimeters.allowSearchIpp', () => {
  it('retourne false quand selectedPopulation est null/undefined', async () => {
    // @ts-expect-error test d'un paramètre invalide
    const result = await servicesPerimeters.allowSearchIpp(null)
    expect(result).toBe(false)
    expect(mockFetchPerimeterAccesses).not.toHaveBeenCalled()
  })

  it('retourne true quand au moins un périmètre autorise la recherche par IPP', async () => {
    mockFetchPerimeterAccesses.mockResolvedValue(
      asAxios([
        { user_id: 'u1', perimeter_id: 1, right_read_patient_nominative: true, right_search_patients_by_ipp: false },
        { user_id: 'u1', perimeter_id: 2, right_read_patient_nominative: true, right_search_patients_by_ipp: true }
      ])
    )
    const population = [makeScopeElement({ id: '1' }), makeScopeElement({ id: '2' })] as Hierarchy<ScopeElement>[]
    const result = await servicesPerimeters.allowSearchIpp(population)
    expect(result).toBe(true)
    // dédoublonne les ids et les joint par une virgule
    expect(mockFetchPerimeterAccesses).toHaveBeenCalledWith('1,2')
  })

  it('retourne false quand aucun périmètre ne l’autorise', async () => {
    mockFetchPerimeterAccesses.mockResolvedValue(
      asAxios([
        { user_id: 'u1', perimeter_id: 1, right_read_patient_nominative: true, right_search_patients_by_ipp: false }
      ])
    )
    const population = [makeScopeElement({ id: '1' })] as Hierarchy<ScopeElement>[]
    const result = await servicesPerimeters.allowSearchIpp(population)
    expect(result).toBe(false)
  })

  it('gère une réponse sans data (data undefined)', async () => {
    mockFetchPerimeterAccesses.mockResolvedValue(asAxios(undefined as never))
    const population = [makeScopeElement({ id: '1' })] as Hierarchy<ScopeElement>[]
    const result = await servicesPerimeters.allowSearchIpp(population)
    expect(result).toBe(false)
  })
})

// --- getRights (nominal, erreurs API, invalide) --------------------------

describe('servicePerimeters.getRights', () => {
  it('mappe les droits renvoyés par le backend (cas nominal)', async () => {
    mockApiBackendGet.mockResolvedValue(
      asAxios({
        count: 1,
        results: [makeReadRight({ perimeter: makeScopeElement({ id: '5' }), right_read_patient_nominative: true })]
      })
    )
    const response = await servicesPerimeters.getRights({ limit: 10, sourceType: SourceType.ALL })
    expect(response.count).toBe(1)
    expect(response.results[0].id).toBe('5')
    expect(response.results[0].access).toBe('Nominatif')
    expect(mockApiBackendGet).toHaveBeenCalledTimes(1)
  })

  it('retourne une réponse vide quand le status n’est pas 200', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({ count: 3, results: [] }, 500))
    const response = await servicesPerimeters.getRights({})
    expect(response).toEqual({ results: [], count: 0 })
  })

  it('retourne une réponse vide quand le backend renvoie un objet vide', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({}, 200))
    const response = await servicesPerimeters.getRights({})
    expect(response).toEqual({ results: [], count: 0 })
  })

  it('capture les erreurs API et retourne une réponse vide', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApiBackendGet.mockRejectedValue(new Error('network error'))
    const response = await servicesPerimeters.getRights({})
    expect(response).toEqual({ results: [], count: 0 })
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

// --- getPerimeters (nominal, erreurs API) --------------------------------

describe('servicePerimeters.getPerimeters', () => {
  it('mappe les périmètres renvoyés par le backend', async () => {
    mockApiBackendGet.mockResolvedValue(
      asAxios({ count: 2, results: [makeScopeElement({ id: '1' }), makeScopeElement({ id: '2' })] })
    )
    const response = await servicesPerimeters.getPerimeters({ ids: '1,2', limit: -1 })
    expect(response.count).toBe(2)
    expect(response.results.map((r) => r.id)).toEqual(['1', '2'])
    expect(response.results[0].system).toBe(System.ScopeTree)
  })

  it('retourne une réponse vide en cas d’erreur API', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApiBackendGet.mockRejectedValue(new Error('boom'))
    const response = await servicesPerimeters.getPerimeters({})
    expect(response).toEqual({ results: [], count: 0 })
    errorSpy.mockRestore()
  })
})

// --- getAccessExpirations / getAccesses (nominal + erreurs) --------------

describe('servicePerimeters.getAccessExpirations', () => {
  it('retourne les données quand la réponse est non vide', async () => {
    const data = [
      { leftDays: 5, start_datetime: new Date(), end_datetime: new Date(), profile: 'p', perimeter: 'H-A' }
    ]
    mockFetchAccessExpirations.mockResolvedValue(asAxios(data))
    const result = await servicesPerimeters.getAccessExpirations({ expiring: true })
    expect(result).toEqual(data)
  })

  it('retourne un tableau vide quand la réponse est vide', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchAccessExpirations.mockResolvedValue(asAxios([]))
    const result = await servicesPerimeters.getAccessExpirations({ expiring: true })
    expect(result).toEqual([])
    errorSpy.mockRestore()
  })

  it('retourne un tableau vide et log l’erreur si l’appel échoue', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchAccessExpirations.mockRejectedValue(new Error('network error'))
    const result = await servicesPerimeters.getAccessExpirations({ expiring: true })
    expect(result).toEqual([])
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

// --- fetchPerimetersRights (mapping des extensions) ----------------------

describe('servicePerimeters.fetchPerimetersRights', () => {
  it('ajoute les extensions READ_ACCESS/EXPORT_ACCESS selon les droits', async () => {
    mockFetchPerimeterAccesses.mockResolvedValue(
      asAxios([
        { user_id: 'u1', perimeter_id: 1, right_read_patient_nominative: true, right_search_patients_by_ipp: false }
      ])
    )
    const perimeters = [makeScopeElement({ id: '1' }), makeScopeElement({ id: '2' })]
    const result = await servicesPerimeters.fetchPerimetersRights(perimeters)
    expect(result[0].extension?.[0]).toEqual({ url: 'READ_ACCESS', valueString: 'DATA_NOMINATIVE' })
    expect(result[1].extension?.[0]).toEqual({ url: 'READ_ACCESS', valueString: 'DATA_PSEUDOANONYMISED' })
    expect(result[0].extension?.[1]).toEqual({ url: 'EXPORT_ACCESS', valueString: 'DATA_PSEUDOANONYMISED' })
  })
})

// --- fetchPopulationForRequeteur (nominal + fallback expired) ------------

describe('servicePerimeters.fetchPopulationForRequeteur', () => {
  it('retourne un tableau vide quand aucun id n’est fourni', async () => {
    const result = await servicesPerimeters.fetchPopulationForRequeteur(undefined)
    expect(result).toEqual([])
  })

  it('retourne la population quand getRights renvoie des résultats', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({ count: 1, results: [makeReadRight()] }))
    const result = await servicesPerimeters.fetchPopulationForRequeteur(['1'])
    expect(result).toHaveLength(1)
    expect(result[0].system).toBe(System.ScopeTree)
  })

  it('retourne un périmètre EXPIRED quand getRights ne renvoie rien', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({ count: 0, results: [] }))
    const result = await servicesPerimeters.fetchPopulationForRequeteur(['1'])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(Rights.EXPIRED)
  })
})
