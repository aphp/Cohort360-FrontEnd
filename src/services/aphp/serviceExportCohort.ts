import { fetchExportTableInfo, fetchExportTableRelationInfo, fetchExportList } from 'services/aphp/callApi'
import { getConfig } from 'config'
import { AxiosResponse } from 'axios'
import { Export, Cohort } from 'types'
import apiBackend from 'services/apiBackend'
import { TableSetting } from 'types/export'

export const fetchExportTablesInfo = () => {
  try {
    const columnCategory = ['none', 'confidential']
    const response = fetchExportTableInfo({
      tableNames: getConfig().features.export.exportTables,
      columnCategory: columnCategory
    })
    return response
  } catch (error) {
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
    return []
  }
}

export const fetchExportsList = async (
  user: string,
  page?: number,
  search?: string | null, //TODO change variable name
  ordering?: string,
  signal?: AbortSignal
) => {
  try {
    const offset = page ? (page - 1) * 20 : 0
    const response = await fetchExportList({
      user: user,
      offset: offset,
      search: search,
      ordering: ordering,
      signal: signal
    })
    return response
  } catch (error) {
    return console.error(error)
  }
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

  return await apiBackend.post<Export>('/exports/', {
    motivation,
    export_tables: tables.map((table: TableSetting) => ({
      table_name: table.tableName,
      cohort_result_source: cohortId?.uuid,
      respect_table_relationships: table.respectTableRelationships,
      columns: table.columns,
      ...(table.fhirFilter && { fhir_filter: table.fhirFilter?.uuid }),
      pivot_merge_columns: table.pivotMergeColumns,
      //pivot_split_columns : table.pivotSplitColumns,
      pivot_merge_ids: table.pivotMergeIds
    })),
    nominative: nominative,
    shift_date: shift_date,
    output_format: outputFormat,
    group_tables: group_tables
  })
}
