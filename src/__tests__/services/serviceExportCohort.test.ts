import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosError, AxiosResponse } from 'axios'
import { Direction, Order } from 'types/searchCriterias'

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({ features: { export: { exportTables: ['patient', 'condition'] } } }))
}))

vi.mock('services/aphp/callApi', () => ({
  fetchExportTableInfo: vi.fn(),
  fetchExportTableRelationInfo: vi.fn(),
  fetchExportList: vi.fn(),
  retryExport: vi.fn()
}))

vi.mock('services/apiBackend', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}))

import {
  fetchExportTableInfo,
  fetchExportTableRelationInfo,
  fetchExportList,
  retryExport as _retryExport
} from 'services/aphp/callApi'
import apiBackend from 'services/apiBackend'
import {
  fetchExportTablesInfo,
  fetchExportTablesRelationsInfo,
  retryExport,
  fetchExportsList,
  fetchExportPurposePrefill,
  postExportCohort
} from 'services/aphp/serviceExportCohort'
import { ExportPurpose } from 'types/export'

const mockFetchTableInfo = vi.mocked(fetchExportTableInfo)
const mockFetchRelationInfo = vi.mocked(fetchExportTableRelationInfo)
const mockFetchList = vi.mocked(fetchExportList)
const mockRetry = vi.mocked(_retryExport)
const mockGet = vi.mocked(apiBackend.get)
const mockPost = vi.mocked(apiBackend.post)

const asAxios = <T,>(data: T, headers: Record<string, string> = {}): AxiosResponse<T> =>
  ({ data, status: 200, statusText: 'OK', headers, config: {} }) as AxiosResponse<T>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('serviceExportCohort.fetchExportTablesInfo', () => {
  it('retourne la réponse de callApi (nominal)', async () => {
    mockFetchTableInfo.mockResolvedValue([{ name: 'patient' }] as never)
    const result = await fetchExportTablesInfo()
    expect(result).toEqual([{ name: 'patient' }])
    expect(mockFetchTableInfo).toHaveBeenCalledWith(
      expect.objectContaining({ tableNames: ['patient', 'condition'] })
    )
  })

  it('retourne [] en cas d’erreur', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchTableInfo.mockRejectedValue(new Error('boom'))
    expect(await fetchExportTablesInfo()).toEqual([])
    errorSpy.mockRestore()
  })
})

describe('serviceExportCohort.fetchExportTablesRelationsInfo', () => {
  it('fusionne Hamiltonian, CentralTable et la liste initiale en dédupliquant', async () => {
    mockFetchRelationInfo.mockResolvedValue({
      verifiedRelations: [
        { relation: 'Hamiltonian', candidates: ['a', 'b'] },
        { relation: 'CentralTable', candidates: ['b', 'c'] }
      ]
    } as never)
    const result = await fetchExportTablesRelationsInfo(['c', 'd'])
    expect(result).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']))
    // dédupliqué: 'b' et 'c' présents une seule fois
    expect(result.filter((x) => x === 'b')).toHaveLength(1)
    expect(result.filter((x) => x === 'c')).toHaveLength(1)
  })

  it('retourne la liste initiale quand aucune relation vérifiée', async () => {
    mockFetchRelationInfo.mockResolvedValue({} as never)
    const result = await fetchExportTablesRelationsInfo(['x'])
    expect(result).toEqual(['x'])
  })

  it('retourne [] en cas d’erreur', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchRelationInfo.mockRejectedValue(new Error('boom'))
    expect(await fetchExportTablesRelationsInfo(['x'])).toEqual([])
    errorSpy.mockRestore()
  })
})

describe('serviceExportCohort.retryExport', () => {
  it('retourne la réponse en cas de succès', async () => {
    mockRetry.mockResolvedValue({ status: 'ok' } as never)
    expect(await retryExport('id-1')).toEqual({ status: 'ok' })
  })

  it('retourne un résultat vide en cas d’erreur', async () => {
    mockRetry.mockRejectedValue(new Error('boom'))
    expect(await retryExport('id-1')).toEqual({ count: 0, results: [] })
  })
})

describe('serviceExportCohort.fetchExportsList', () => {
  it('calcule l’offset et l’ordre descendant', async () => {
    mockFetchList.mockResolvedValue({ count: 1, results: [] } as never)
    await fetchExportsList({
      user: 'u1',
      page: 3,
      orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }
    })
    expect(mockFetchList).toHaveBeenCalledWith(
      expect.objectContaining({ user: 'u1', offset: 40, ordering: `-${Order.CREATED_AT}` })
    )
  })

  it('utilise l’ordre ascendant sans préfixe', async () => {
    mockFetchList.mockResolvedValue({ count: 0, results: [] } as never)
    await fetchExportsList({
      user: 'u1',
      page: 1,
      orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.ASC }
    })
    expect(mockFetchList).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, ordering: Order.CREATED_AT })
    )
  })

  it('retourne un résultat vide en cas d’erreur', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchList.mockRejectedValue(new Error('boom'))
    expect(
      await fetchExportsList({ user: 'u1', page: 1, orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.ASC } })
    ).toEqual({ count: 0, results: [] })
    errorSpy.mockRestore()
  })
})

describe('serviceExportCohort.postExportCohort', () => {
  it('construit le payload d’export à partir des tables', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-1' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-1' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: true,
      outputFormat: 'csv',
      tables: [
        {
          tableName: 'patient',
          respectTableRelationships: true,
          columns: ['id'],
          fhirFilter: { uuid: 'filter-1' },
          pivotMergeColumns: [],
          pivotMergeIds: []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      ]
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/exports/',
      expect.objectContaining({
        purpose: 'care_support',
        project_details: null,
        output_format: 'csv',
        group_tables: true,
        nominative: true,
        shift_date: false,
        export_tables: [
          expect.objectContaining({
            table_name: 'patient',
            cohort_result_source: 'cohort-1',
            fhir_filter: 'filter-1'
          })
        ]
      })
    )
    expect(mockPost.mock.calls[0][1]).not.toHaveProperty('motivation')
  })

  it('envoie les informations du projet en recherche interne', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-7' }))
    const projectDetails = { title: 'Projet X', project_leader: 'Jeanne Martin', start_date: '2026-06-01', end_date: null }
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-7' } as any,
      purpose: ExportPurpose.INTERNAL_RESEARCH,
      projectDetails,
      group_tables: true,
      outputFormat: 'csv',
      tables: []
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/exports/',
      expect.objectContaining({ purpose: 'internal_research', project_details: projectDetails })
    )
  })

  it('ajoute automatiquement patient__identifier quand Patient est sélectionné', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-3' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-3' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: false,
      outputFormat: 'csv',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'Patient', respectTableRelationships: true, columns: null, fhirFilter: null } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: { table_name: string; cohort_result_source: string }[] }
    const tableNames = payload.export_tables.map((table) => table.table_name)
    expect(tableNames).toEqual(['Patient', 'patient__identifier'])
    payload.export_tables.forEach((table) => {
      expect(table.cohort_result_source).toBe('cohort-3')
    })
  })

  it('ne duplique pas une sous-table liée déjà sélectionnée', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-4' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-4' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: false,
      outputFormat: 'csv',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'Patient', respectTableRelationships: true, columns: null, fhirFilter: null } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'patient__identifier', respectTableRelationships: true, columns: null, fhirFilter: null } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: { table_name: string }[] }
    const tableNames = payload.export_tables.map((table) => table.table_name)
    expect(tableNames).toEqual(['Patient', 'patient__identifier'])
    expect(tableNames.filter((name) => name === 'patient__identifier')).toHaveLength(1)
  })

  it("n'ajoute pas patient__identifier en export regroupé", async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-5' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-5' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: true,
      outputFormat: 'csv',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'Patient', respectTableRelationships: true, columns: null, fhirFilter: null } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'visit_occurrence', respectTableRelationships: true, columns: null, fhirFilter: null } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: { table_name: string }[] }
    const tableNames = payload.export_tables.map((table) => table.table_name)
    expect(tableNames).toEqual(['Patient', 'visit_occurrence'])
  })

  it("n'ajoute pas patient__identifier en export regroupé même si Patient est la seule table", async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-6' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-6' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: true,
      outputFormat: 'csv',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'Patient', respectTableRelationships: true, columns: null, fhirFilter: null } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: { table_name: string }[] }
    const tableNames = payload.export_tables.map((table) => table.table_name)
    expect(tableNames).toEqual(['Patient'])
  })

  it('omet fhir_filter quand aucun filtre n’est fourni', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-2' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-2' } as any,
      purpose: ExportPurpose.CARE_SUPPORT,
      projectDetails: null,
      group_tables: false,
      outputFormat: 'xlsx',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'condition', respectTableRelationships: false, columns: [], pivotMergeColumns: [], pivotMergeIds: [] } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: Record<string, unknown>[] }
    expect(payload.export_tables[0]).not.toHaveProperty('fhir_filter')
  })
})

describe('serviceExportCohort.fetchExportPurposePrefill', () => {
  it('interroge la route de préremplissage avec la cohorte', async () => {
    const prefill = { purpose: 'care_support', project_details: null }
    mockGet.mockResolvedValue(asAxios(prefill))
    expect(await fetchExportPurposePrefill('cohort-1')).toEqual(prefill)
    expect(mockGet).toHaveBeenCalledWith('/exports/prefill-purpose/', { params: { cohort: 'cohort-1' } })
  })

  it('retourne null sans export de référence (204)', async () => {
    mockGet.mockResolvedValue({ ...asAxios(''), status: 204 })
    expect(await fetchExportPurposePrefill('cohort-1')).toBeNull()
  })

  it("retourne null quand l'appel échoue", async () => {
    // apiBackend résout les erreurs au lieu de les rejeter, et ne renvoie rien sans réponse du serveur
    mockGet.mockResolvedValue(new AxiosError('Not Found', '404', undefined, undefined, { status: 404 } as never) as never)
    expect(await fetchExportPurposePrefill('cohort-1')).toBeNull()
    mockGet.mockResolvedValue(undefined as never)
    expect(await fetchExportPurposePrefill('cohort-1')).toBeNull()
  })
})
