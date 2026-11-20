import {
  fetchExportTableInfo,
  fetchExportTableRelationInfo,
  fetchExportList,
  retryExport as _retryExport
} from 'services/aphp/callApi'
import { getConfig } from 'config'
import { AxiosResponse, isAxiosError } from 'axios'
import { Export, Cohort } from 'types'
import apiBackend from 'services/apiBackend'
import { TableSetting } from 'types/export'
import { Direction, OrderBy } from 'types/searchCriterias'

export const fetchExportTablesInfo = async () => {
  try {
    const columnCategory = ['none', 'confidential']
    const response = await fetchExportTableInfo({
      tableNames: getConfig().features.export.exportTables,
      columnCategory: columnCategory
    })
    return response
  } catch (error) {
    console.error(error)
    return []
  }
}

export const fetchExportTablesRelationsInfo = async (tableList: string[]) => {
  try {
    const columnCategory = ['none', 'confidential']
    const _tableList = tableList.join()
    const call = await fetchExportTableRelationInfo({ tableNames: _tableList, columnCategory: columnCategory })
    const hamiltonian =
      call?.verifiedRelations?.find((table: any) => table.relation === 'Hamiltonian')?.candidates || []
    const centralTable =
      call?.verifiedRelations?.find((table: any) => table.relation === 'CentralTable')?.candidates || []
    const result: string[] = hamiltonian.concat(centralTable).concat(tableList)
    const response: string[] = Array.from(new Set(result))
    return response
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getExportDownloadErrorMessage = (status?: number): string => {
  if (status === 400) return "L'export n'est pas disponible au téléchargement (non terminé ou fichiers supprimés)."
  if (status === 500 || status === 503) return 'Le stockage est momentanément indisponible, réessayez plus tard.'
  return 'Erreur lors du téléchargement.'
}

export class ExportDownloadError extends Error {
  status?: number

  constructor(status?: number) {
    super(getExportDownloadErrorMessage(status))
    this.name = 'ExportDownloadError'
    this.status = status
  }
}

/**
 * Starts the browser's own download of an export: the file goes straight to disk, never into the tab's memory.
 * Following a link can't send the Bearer, so we first get a short-lived export download token.
 * @param id The ID of the export to download.
 * @param signal An optional AbortSignal to cancel the token request.
 * @throws ExportDownloadError if the token can't be obtained.
 */
export const downloadExport = async (id: string, signal?: AbortSignal) => {
  let status: number | undefined
  let token: string | undefined
  try {
    // the interceptor resolves 4xx/5xx with the AxiosError instead of rejecting
    const response = await apiBackend.post<{ token: string }>(`/exports/${id}/download-token/`, null, { signal })
    if (isAxiosError(response)) status = response.response?.status
    else if (response?.status === 200) token = response.data?.token
    else status = response?.status
  } catch (error) {
    status = isAxiosError(error) ? error.response?.status : undefined
  }
  if (signal?.aborted) return
  if (!token) throw new ExportDownloadError(status)
  window.location.assign(`${apiBackend.defaults.baseURL}/exports/${id}/download/?token=${encodeURIComponent(token)}`)
}

export const retryExport = async (id: string, signal?: AbortSignal) => {
  try {
    const response = await _retryExport({ id, signal })
    return response
  } catch (error) {
    return {
      count: 0,
      results: []
    }
  }
}

export const fetchExportsList = async (
  {
    user,
    page,
    input,
    orderBy,
    offset = 20
  }: {
    user: string
    page: number
    input?: string
    orderBy: OrderBy
    offset?: number
  },
  signal?: AbortSignal
) => {
  try {
    const _orderBy = orderBy.orderDirection === Direction.ASC ? orderBy.orderBy : `-${orderBy.orderBy}`
    const response = await fetchExportList({
      user,
      offset: page ? (page - 1) * offset : 0,
      search: input,
      ordering: _orderBy,
      signal
    })
    return response
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      results: []
    }
  }
}

const AUTO_LINKED_TABLES: Record<string, string[]> = {
  Patient: ['patient__identifier']
}

export const postExportCohort = async ({
  cohortId,
  motivation,
  group_tables,
  outputFormat,
  tables
}: {
  cohortId: Cohort
  motivation: string
  group_tables: boolean
  outputFormat: string
  tables: TableSetting[]
}): Promise<AxiosResponse<Export>> => {
  const nominative = true
  const shift_date = false

  const export_tables = tables.map((table: TableSetting) => ({
    table_name: table.tableName,
    cohort_result_source: cohortId?.uuid,
    respect_table_relationships: table.respectTableRelationships,
    columns: table.columns,
    ...(table.fhirFilter && { fhir_filter: table.fhirFilter?.uuid }),
    pivot_merge_columns: table.pivotMergeColumns,
    //pivot_split_columns : table.pivotSplitColumns,
    pivot_merge_ids: table.pivotMergeIds
  }))
  // Le dataexporter refuse la jointure sur clé primaire dès qu'une sous-table est demandée,
  // celle-ci étant en relation 1-N avec sa table parente.
  if (!group_tables) {
    const existingTableNames = new Set(export_tables.map((table) => table.table_name))
    tables.forEach((table: TableSetting) => {
      const linkedTables = AUTO_LINKED_TABLES[table.tableName]
      if (!linkedTables) return
      linkedTables.forEach((linkedTableName) => {
        if (existingTableNames.has(linkedTableName)) return
        existingTableNames.add(linkedTableName)
        export_tables.push({
          table_name: linkedTableName,
          cohort_result_source: cohortId?.uuid,
          respect_table_relationships: table.respectTableRelationships,
          columns: null,
          pivot_merge_columns: undefined,
          pivot_merge_ids: undefined
        })
      })
    })
  }

  return await apiBackend.post<Export>('/exports/', {
    motivation,
    export_tables,
    nominative: nominative,
    shift_date: shift_date,
    output_format: outputFormat,
    group_tables: group_tables
  })
}
