import { getConfig } from 'config'
import { CohortImaging } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import { fetchDiagnosticReport } from './callApi'
import { ImagingStudy } from 'fhir/r4'

export const linkToDiagnosticReport = async (
  imagingList: ImagingStudy[],
  signal?: AbortSignal
): Promise<CohortImaging[]> => {
  const config = getConfig()
  if (!config.features.diagnosticReport.enabled || !config.features.diagnosticReport.useStudyParam) {
    return Promise.resolve(imagingList)
  }
  const diagnosticReports = getApiResponseResources(
    await fetchDiagnosticReport({
      study: imagingList.map((study) => study.id as string),
      signal
    })
  )
  return imagingList.map((imaging) => ({
    ...imaging,
    diagnosticReport: diagnosticReports?.find((report) =>
      report.imagingStudy?.find((study) => study.reference === `ImagingStudy/${imaging.id}`)
    )
  }))
}
