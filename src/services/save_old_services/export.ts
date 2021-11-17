// @ts-nocheck
import apiPortailCohort from '../apiPortail'

type createExportProps = { cohortId: number; motivation: string; tables: string[]; output_format?: string }
export const createExport = async (args: createExportProps) => {
  try {
    const { cohortId, motivation, tables, output_format = 'csv' } = args

    const exportResponse = await Promise.all([
      new Promise((resolve) => {
        resolve(
          apiPortailCohort.post('/exports/', {
            cohort_id: cohortId,
            motivation,
            tables: tables.map((table: string) => ({
              omop_table_name: table
            })),
            output_format
          })
        )
      })
        .then((values) => {
          return values
        })
        .catch((error) => {
          return error
        })
    ])

    if (exportResponse && exportResponse[0] && exportResponse[0].status !== 201) {
      return { error: exportResponse[0] && exportResponse[0].response.data }
    } else {
      return exportResponse[0] && exportResponse[0].data
    }
  } catch (error) {
    return { error }
  }
}
