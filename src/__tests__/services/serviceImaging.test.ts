import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { DiagnosticReport, ImagingStudy } from 'fhir/r4'
import { getConfig, type AppConfig } from 'config'
import { FHIR_Bundle_Response } from 'types'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('config', () => ({
  getConfig: vi.fn()
}))

vi.mock('services/aphp/callApi', () => ({
  fetchDiagnosticReport: vi.fn()
}))

import { fetchDiagnosticReport } from 'services/aphp/callApi'
import { linkToDiagnosticReport } from 'services/aphp/serviceImaging'

const mockGetConfig = vi.mocked(getConfig)
const mockFetchDiagnosticReport = vi.mocked(fetchDiagnosticReport)

let baseConfig: Readonly<AppConfig>

const buildDiagnosticReportConfig = (enabled: boolean, useStudyParam: boolean): Readonly<AppConfig> => ({
  ...baseConfig,
  features: {
    ...baseConfig.features,
    diagnosticReport: {
      ...baseConfig.features.diagnosticReport,
      enabled,
      useStudyParam
    }
  }
})

const axiosConfig: InternalAxiosRequestConfig = {
  headers: new AxiosHeaders(),
  method: 'post',
  url: '/DiagnosticReport/_search'
}

const buildBundleResponse = (reports: DiagnosticReport[]): AxiosResponse<FHIR_Bundle_Response<DiagnosticReport>> => ({
  data: {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: reports.map((resource) => ({ resource }))
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: axiosConfig
})

const makeImagingStudy = (id: string, patientId = 'p1'): ImagingStudy => ({
  resourceType: 'ImagingStudy',
  id,
  status: 'available',
  subject: { reference: `Patient/${patientId}` }
})

describe('serviceImaging.linkToDiagnosticReport', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const actualConfigModule = await vi.importActual<typeof import('config')>('config')
    baseConfig = actualConfigModule.getConfig()
  })

  it('retourne la liste telle quelle quand la feature est désactivée', async () => {
    mockGetConfig.mockReturnValue(buildDiagnosticReportConfig(false, false))

    const imagingList: ImagingStudy[] = [makeImagingStudy('study-1')]

    const result = await linkToDiagnosticReport(imagingList)

    expect(result).toEqual(imagingList)
    expect(mockFetchDiagnosticReport).not.toHaveBeenCalled()
  })

  it('utilise le paramètre study quand useStudyParam est activé', async () => {
    mockGetConfig.mockReturnValue(buildDiagnosticReportConfig(true, true))

    mockFetchDiagnosticReport.mockResolvedValue(buildBundleResponse([]))

    const imagingList: ImagingStudy[] = [makeImagingStudy('study-1', 'p1'), makeImagingStudy('study-2', 'p2')]

    await linkToDiagnosticReport(imagingList)

    expect(mockFetchDiagnosticReport).toHaveBeenCalledWith(
      expect.objectContaining({
        study: ['study-1', 'study-2']
      })
    )
    expect(mockFetchDiagnosticReport).toHaveBeenCalledWith(
      expect.not.objectContaining({ patient: expect.anything() })
    )
  })

  it('utilise le paramètre patient (dédupliqué) quand useStudyParam est désactivé', async () => {
    mockGetConfig.mockReturnValue(buildDiagnosticReportConfig(true, false))

    mockFetchDiagnosticReport.mockResolvedValue(buildBundleResponse([]))

    const imagingList: ImagingStudy[] = [
      makeImagingStudy('study-1', 'p1'),
      makeImagingStudy('study-2', 'p1'),
      makeImagingStudy('study-3', 'p2')
    ]

    await linkToDiagnosticReport(imagingList)

    expect(mockFetchDiagnosticReport).toHaveBeenCalledWith(
      expect.objectContaining({
        patient: ['p1', 'p2']
      })
    )
    expect(mockFetchDiagnosticReport).toHaveBeenCalledWith(
      expect.not.objectContaining({ study: expect.anything() })
    )
  })

  it('associe les reports par imagingStudy.reference et privilégie celui qui a un PDF', async () => {
    mockGetConfig.mockReturnValue(buildDiagnosticReportConfig(true, false))

    const reportWithoutPdf: DiagnosticReport = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: { text: 'CR sans PDF' },
      imagingStudy: [{ reference: 'ImagingStudy/study-1' }],
      presentedForm: [{ contentType: 'text/plain', url: 'Binary/no-pdf' }]
    }

    const reportWithPdf: DiagnosticReport = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: { text: 'CR avec PDF' },
      imagingStudy: [{ reference: 'ImagingStudy/study-1' }],
      presentedForm: [{ contentType: 'application/pdf', url: 'Binary/pdf-1' }]
    }

    mockFetchDiagnosticReport.mockResolvedValue(buildBundleResponse([reportWithoutPdf, reportWithPdf]))

    const imagingList: ImagingStudy[] = [makeImagingStudy('study-1', 'p1'), makeImagingStudy('study-2', 'p1')]

    const result = await linkToDiagnosticReport(imagingList)

    expect(result[0].diagnosticReport).toEqual(reportWithPdf)
    expect(result[1].diagnosticReport).toBeUndefined()
  })
})
