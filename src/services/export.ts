import apiPortailCohort from './apiPortail'

type createExportProps = { cohortId: string; motivation: string; tables: string[]; output_format?: string }
export const createExport = async (args: createExportProps) => {
  const { cohortId, motivation, tables, output_format = 'csv' } = args
  console.log(`cohortId`, cohortId)
  console.log(`motivation`, motivation)
  console.log(`tables`, tables)
  console.log(`output_format`, output_format)

  const exportResponse = await apiPortailCohort.post('/exports/', { cohortId, motivation, tables, output_format })
  console.log(`exportResponse`, exportResponse)
  if (exportResponse.status !== 200) {
    console.error(exportResponse.data)
  }
}
