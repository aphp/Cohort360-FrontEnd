import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'
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
  postExportCohort
} from 'services/aphp/serviceExportCohort'

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
      motivation: 'analyse',
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
        motivation: 'analyse',
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
  })

  it('envoie uniquement les tables sélectionnées', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-3' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-3' } as any,
      motivation: 'analyse',
      group_tables: false,
      outputFormat: 'csv',
      tables: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'Patient', respectTableRelationships: true, columns: null, fhirFilter: null } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { tableName: 'visit_occurrence', respectTableRelationships: true, columns: null, fhirFilter: null } as any
      ]
    })
    const payload = mockPost.mock.calls[0][1] as { export_tables: { table_name: string }[] }
    expect(payload.export_tables.map((table) => table.table_name)).toEqual(['Patient', 'visit_occurrence'])
  })

  it('omet fhir_filter quand aucun filtre n’est fourni', async () => {
    mockPost.mockResolvedValue(asAxios({ uuid: 'exp-2' }))
    await postExportCohort({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cohortId: { uuid: 'cohort-2' } as any,
      motivation: '',
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
