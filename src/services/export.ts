import apiPortailCohort from './apiPortail'

type createExportProps = { cohortId: number; motivation: string; tables: string[]; output_format?: string }
export const createExport = async (args: createExportProps) => {
  const { cohortId, motivation, tables, output_format = 'csv' } = args

  const exportResponse = await apiPortailCohort.post('/exports/', {
    cohort_id: cohortId,
    motivation,
    tables: tables.map((table: string) => ({
      omop_table_name: table
    })),
    output_format
  })
  if (exportResponse && exportResponse.status !== 200) {
    console.error(exportResponse.data)
  }
}
