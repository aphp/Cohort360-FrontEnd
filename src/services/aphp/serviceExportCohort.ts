import { fetchExportTableInfo } from 'services/aphp/callApi'
import { getConfig } from 'config'
import { AxiosResponse, isAxiosError, AxiosError } from 'axios'
import { Export, Cohort } from 'types'
import apiBackend from 'services/apiBackend'
import { TableSetting } from 'pages/ExportRequest/components/ExportForm'

export const fetchExportTablesInfo = () => {
  try {
    const response = fetchExportTableInfo({ tableNames: getConfig().features.export.exportTables })
    return response
  } catch (error) {
    return []
  }
}

export const fetchExportTablesRelationsInfo = async (tableList: (string | null)[]) => {
  try {
    const call = await fetchExportTableInfo({ relationLink: tableList })
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
}): Promise<AxiosResponse<Export> | AxiosError> => {
  try {
    const nominative = true
    const shift_date = false

    return await apiBackend.post<Export>('/exports/', {
      motivation,
      export_tables: tables.map((table: TableSetting) => ({
        table_name: table.tableName,
        cohort_result_source: cohortId?.uuid,
        respect_table_relationships: table.respectTableRelationships,
        columns: table.columns,
        ...(table.fhirFilter && { fhir_filter: table.fhirFilter?.uuid })
      })),
      nominative: nominative,
      shift_date: shift_date,
      output_format: outputFormat,
      group_tables: group_tables
    })
  } catch (error) {
    if (isAxiosError(error)) return error
    else throw error
  }
}
