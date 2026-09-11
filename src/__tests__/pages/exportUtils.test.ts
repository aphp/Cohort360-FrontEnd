import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getResourceType, getExportTableLabel, sortTables } from 'pages/ExportRequest/components/exportUtils'
import { ResourceType } from 'types/requestCriterias'
import { TableInfo } from 'types/export'

// getResourceType / getExportTableLabel / sortTables sont des fonctions pures.
// fetchResourceCount2 est testé pour son chemin d'erreur (propagation).

vi.mock('services/aphp/callApi', () => ({
  fetchPatient: vi.fn(),
  fetchCondition: vi.fn(),
  fetchProcedure: vi.fn(),
  fetchClaim: vi.fn(),
  fetchDocumentReference: vi.fn(),
  fetchMedicationRequest: vi.fn(),
  fetchMedicationAdministration: vi.fn(),
  fetchObservation: vi.fn(),
  fetchImaging: vi.fn(),
  fetchForms: vi.fn()
}))

vi.mock('mappers/filters', () => ({
  mapRequestParamsToSearchCriteria: vi.fn().mockResolvedValue({
    searchBy: 'text',
    searchInput: '',
    orderBy: {},
    filters: { genders: [], vitalStatuses: [], birthdatesRanges: [null, null] }
  })
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({ features: { questionnaires: { defaultFilterFormNames: [] } } }))
  }
})

import { fetchPatient } from 'services/aphp/callApi'
import { fetchResourceCount2 } from 'pages/ExportRequest/components/exportUtils'

const mockFetchPatient = vi.mocked(fetchPatient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('exportUtils.getResourceType', () => {
  it('mappe les noms de table connus vers le bon ResourceType', () => {
    expect(getResourceType('Patient')).toBe(ResourceType.PATIENT)
    expect(getResourceType('condition')).toBe(ResourceType.CONDITION)
    expect(getResourceType('note')).toBe(ResourceType.DOCUMENTS)
    expect(getResourceType('imaging_study')).toBe(ResourceType.IMAGING)
    expect(getResourceType('drug_exposure_prescription')).toBe(ResourceType.MEDICATION_REQUEST)
  })

  it('retourne UNKNOWN pour un nom de table inconnu', () => {
    expect(getResourceType('table_inexistante')).toBe(ResourceType.UNKNOWN)
    expect(getResourceType('')).toBe(ResourceType.UNKNOWN)
  })
})

describe('exportUtils.getExportTableLabel', () => {
  it('retourne le libellé fonctionnel (insensible à la casse)', () => {
    expect(getExportTableLabel('patient')).toBe('Patient')
    expect(getExportTableLabel('PATIENT')).toBe('Patient')
    expect(getExportTableLabel('condition')).toBe('Fait - PMSI - Diagnostics')
  })

  it('retourne "-" pour un nom inconnu', () => {
    expect(getExportTableLabel('inconnu')).toBe('-')
  })
})

describe('exportUtils.sortTables', () => {
  it('place la table Patient en premier puis trie alphabétiquement', () => {
    const tables = [
      { name: 'condition' },
      { name: 'Patient' },
      { name: 'aaa' }
    ] as TableInfo[]
    const sorted = sortTables(tables)
    expect(sorted.map((t) => t.name)).toEqual(['Patient', 'aaa', 'condition'])
  })
})

describe('exportUtils.fetchResourceCount2', () => {
  it('retourne le total renvoyé par le fetcher (cas nominal)', async () => {
    // fetchPatientCount passe par moment() sur les bornes de dates: on neutralise
    // le warning de dépréciation moment (non bloquant) pour garder la sortie propre.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockFetchPatient.mockResolvedValue({ data: { resourceType: 'Bundle', total: 7 } } as never)
    const count = await fetchResourceCount2('cohort-1', ResourceType.PATIENT)
    expect(count).toBe(7)
    warnSpy.mockRestore()
  })

  it('propage l’erreur en cas d’échec du fetcher (erreur API)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchPatient.mockRejectedValue(new Error('API down'))
    await expect(fetchResourceCount2('cohort-1', ResourceType.PATIENT)).rejects.toThrow('API down')
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
