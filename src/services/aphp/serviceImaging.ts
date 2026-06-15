import { getConfig } from 'config'
import { CohortImaging } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import { fetchDiagnosticReport } from './callApi'
import { DiagnosticReport, ImagingStudy } from 'fhir/r4'

// Extract Patient id from references like Patient/{id}.
const getPatientIdFromReference = (reference?: string) => {
  if (!reference) return undefined
  const match = reference.match(/Patient\/([^/]+)/)
  return match?.[1]
}

// Extract ImagingStudy id from references like ImagingStudy/{id}.
const getStudyIdFromReference = (reference?: string) => {
  if (!reference) return undefined
  const match = reference.match(/ImagingStudy\/([^/]+)/)
  return match?.[1]
}

// Prefer reports that expose an actual PDF attachment url.
const hasPdfInPresentedForm = (report?: DiagnosticReport) =>
  !!report?.presentedForm?.some((attachment) => attachment.contentType === 'application/pdf' && !!attachment.url)

export const linkToDiagnosticReport = async (
  imagingList: ImagingStudy[],
  signal?: AbortSignal
): Promise<CohortImaging[]> => {
  const config = getConfig()

  // Fast exit when feature is off or there is no study to enrich.
  if (!config.features.diagnosticReport.enabled || imagingList.length === 0) {
    return Promise.resolve(imagingList)
  }

  const studyIds = imagingList.map((study) => study.id).filter((id): id is string => !!id)
  const patientIds = [
    ...new Set(
      imagingList.map((study) => getPatientIdFromReference(study.subject?.reference)).filter((id): id is string => !!id)
    )
  ]

  // Two modes:
  // - useStudyParam=true: query DiagnosticReport by study ids
  // - useStudyParam=false: standard R4 fallback, query by patient ids then filter client-side
  const useStudyParam = config.features.diagnosticReport.useStudyParam && studyIds.length > 0
  const diagnosticReportArgs = {
    signal,
    ...(useStudyParam ? { study: studyIds } : {}),
    ...(!useStudyParam ? { patient: patientIds } : {})
  }

  // Nothing to query means no possible enrichment.
  if (!diagnosticReportArgs.study && !diagnosticReportArgs.patient) {
    return Promise.resolve(imagingList)
  }

  const diagnosticReports = getApiResponseResources(await fetchDiagnosticReport(diagnosticReportArgs))

  // Build an index by ImagingStudy id for O(1) lookup during final mapping.
  const reportByStudyId = new Map<string, DiagnosticReport>()
  for (const report of diagnosticReports ?? []) {
    for (const imagingStudyRef of report.imagingStudy ?? []) {
      const studyId = getStudyIdFromReference(imagingStudyRef.reference)
      if (!studyId) continue

      const previous = reportByStudyId.get(studyId)
      // If multiple reports match the same study, keep the one that provides a PDF.
      if (!previous || (!hasPdfInPresentedForm(previous) && hasPdfInPresentedForm(report))) {
        reportByStudyId.set(studyId, report)
      }
    }
  }

  return imagingList.map((imaging) => ({
    ...imaging,
    diagnosticReport: imaging.id ? reportByStudyId.get(imaging.id) : undefined
  }))
}
