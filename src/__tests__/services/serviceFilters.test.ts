import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchCriterias } from 'types/searchCriterias'

// serviceFilters orchestre les appels callApi et le mapping des critères.
// On mocke callApi, le mapper et le parser d'identifiants.

vi.mock('services/apiBackend', () => ({
  default: { get: vi.fn() }
}))

vi.mock('services/aphp/callApi', () => ({
  postFilters: vi.fn(),
  getFilters: vi.fn(),
  deleteFilter: vi.fn(),
  deleteFilters: vi.fn(),
  patchFilters: vi.fn()
}))

vi.mock('mappers/filters', () => ({
  mapSearchCriteriasToRequestParams: vi.fn(() => 'ga=1&gb=2')
}))

vi.mock('../../utils/fhirFilterParser', () => ({
  isIdentifyingFilter: vi.fn(() => false)
}))

import { postFilters, getFilters, deleteFilter, deleteFilters, patchFilters } from 'services/aphp/callApi'
import { mapSearchCriteriasToRequestParams } from 'mappers/filters'
import { isIdentifyingFilter } from '../../utils/fhirFilterParser'
import apiBackend from 'services/apiBackend'
import {
  getProviderFilters,
  postFiltersService,
  getFiltersService,
  deleteFilterService,
  deleteFiltersService,
  patchFiltersService
} from 'services/aphp/serviceFilters'

const mockApiBackendGet = vi.mocked(apiBackend.get)
const mockPostFilters = vi.mocked(postFilters)
const mockGetFilters = vi.mocked(getFilters)
const mockDeleteFilter = vi.mocked(deleteFilter)
const mockDeleteFilters = vi.mocked(deleteFilters)
const mockPatchFilters = vi.mocked(patchFilters)
const mockMapper = vi.mocked(mapSearchCriteriasToRequestParams)
const mockIsIdentifying = vi.mocked(isIdentifyingFilter)

const asAxios = <T,>(data: T, status = 200): AxiosResponse<T> =>
  ({ data, status, statusText: 'OK', headers: {}, config: {} }) as AxiosResponse<T>

const criterias = {} as SearchCriterias<Filters>

beforeEach(() => {
  vi.clearAllMocks()
  mockMapper.mockReturnValue('ga=1&gb=2')
  mockIsIdentifying.mockReturnValue(false)
})

describe('serviceFilters.getProviderFilters', () => {
  it('retourne [] quand les paramètres sont invalides (manquants)', async () => {
    expect(await getProviderFilters(undefined, ResourceType.PATIENT)).toEqual([])
    expect(await getProviderFilters('user1', undefined)).toEqual([])
    expect(mockApiBackendGet).not.toHaveBeenCalled()
  })

  it('retourne les résultats en cas de succès (nominal)', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({ results: [{ uuid: 'f1' }] }))
    const result = await getProviderFilters('user1', ResourceType.PATIENT)
    expect(result).toEqual([{ uuid: 'f1' }])
    expect(mockApiBackendGet).toHaveBeenCalledWith(expect.stringContaining('owner_id=user1'))
  })

  it('retourne [] quand le status n’est pas 200 (erreur API)', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({ results: [{ uuid: 'f1' }] }, 500))
    expect(await getProviderFilters('user1', ResourceType.PATIENT)).toEqual([])
  })

  it('retourne [] quand results est absent', async () => {
    mockApiBackendGet.mockResolvedValue(asAxios({}))
    expect(await getProviderFilters('user1', ResourceType.PATIENT)).toEqual([])
  })
})

describe('serviceFilters.postFiltersService', () => {
  it('poste un filtre non identifiant en mode nominatif (nominal)', async () => {
    mockPostFilters.mockResolvedValue(asAxios({ uuid: 'created' }) as never)
    const result = await postFiltersService(ResourceType.PATIENT, 'Mon filtre', criterias, false)
    expect(result).toEqual({ uuid: 'created' })
    // en mode nominatif on vérifie le caractère identifiant
    expect(mockIsIdentifying).toHaveBeenCalledWith('ga=1&gb=2')
    expect(mockPostFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 'Mon filtre', 'ga=1&gb=2', false)
  })

  it('ne teste pas le caractère identifiant en mode pseudonymisé', async () => {
    mockPostFilters.mockResolvedValue(asAxios({ uuid: 'created' }) as never)
    await postFiltersService(ResourceType.PATIENT, 'f', criterias, true)
    expect(mockIsIdentifying).not.toHaveBeenCalled()
    expect(mockPostFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 'f', 'ga=1&gb=2', false)
  })

  it('propage identifying=true quand le filtre est identifiant', async () => {
    mockIsIdentifying.mockReturnValue(true)
    mockPostFilters.mockResolvedValue(asAxios({ uuid: 'created' }) as never)
    await postFiltersService(ResourceType.PATIENT, 'f', criterias, false)
    expect(mockPostFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 'f', 'ga=1&gb=2', true)
  })

  it('lève une erreur quand la réponse est hors 2xx (erreur API)', async () => {
    mockPostFilters.mockResolvedValue(asAxios({ uuid: 'x' }, 400) as never)
    await expect(postFiltersService(ResourceType.PATIENT, 'f', criterias, false)).rejects.toThrow()
  })
})

describe('serviceFilters.getFiltersService', () => {
  it('retourne les données en cas de succès', async () => {
    mockGetFilters.mockResolvedValue(asAxios({ count: 2, results: [] }) as never)
    const result = await getFiltersService(ResourceType.PATIENT, null, 20)
    expect(result).toEqual({ count: 2, results: [] })
    expect(mockGetFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 20, 0, null)
  })

  it('utilise la limite par défaut de 10', async () => {
    mockGetFilters.mockResolvedValue(asAxios({ count: 0, results: [] }) as never)
    await getFiltersService(ResourceType.PATIENT)
    expect(mockGetFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 10, 0, undefined)
  })

  it('lève une erreur quand la réponse est hors 2xx', async () => {
    mockGetFilters.mockResolvedValue(asAxios({ count: 0, results: [] }, 503) as never)
    await expect(getFiltersService(ResourceType.PATIENT)).rejects.toThrow()
  })
})

describe('serviceFilters.deleteFilterService / deleteFiltersService', () => {
  it('supprime un filtre (nominal)', async () => {
    mockDeleteFilter.mockResolvedValue(asAxios(undefined as never, 204))
    const res = await deleteFilterService('uuid-1')
    expect(res.status).toBe(204)
    expect(mockDeleteFilter).toHaveBeenCalledWith('uuid-1')
  })

  it('lève une erreur si la suppression simple échoue', async () => {
    mockDeleteFilter.mockResolvedValue(asAxios(undefined as never, 500))
    await expect(deleteFilterService('uuid-1')).rejects.toThrow()
  })

  it('supprime plusieurs filtres (nominal)', async () => {
    mockDeleteFilters.mockResolvedValue(asAxios(undefined as never, 204))
    const res = await deleteFiltersService(['a', 'b'])
    expect(res.status).toBe(204)
    expect(mockDeleteFilters).toHaveBeenCalledWith(['a', 'b'])
  })

  it('lève une erreur si la suppression multiple échoue', async () => {
    mockDeleteFilters.mockResolvedValue(asAxios(undefined as never, 400))
    await expect(deleteFiltersService(['a'])).rejects.toThrow()
  })
})

describe('serviceFilters.patchFiltersService', () => {
  it('met à jour un filtre (nominal)', async () => {
    mockPatchFilters.mockResolvedValue(asAxios({ uuid: 'u1' }, 200) as never)
    const res = await patchFiltersService(ResourceType.PATIENT, 'u1', 'nouveau nom', criterias, false)
    expect(res.data).toEqual({ uuid: 'u1' })
    expect(mockMapper).toHaveBeenCalled()
    expect(mockPatchFilters).toHaveBeenCalledWith(ResourceType.PATIENT, 'u1', 'nouveau nom', 'ga=1&gb=2')
  })

  it('lève une erreur quand la réponse est hors 2xx', async () => {
    mockPatchFilters.mockResolvedValue(asAxios({ uuid: 'u1' }, 422) as never)
    await expect(patchFiltersService(ResourceType.PATIENT, 'u1', 'n', criterias, false)).rejects.toThrow()
  })
})
