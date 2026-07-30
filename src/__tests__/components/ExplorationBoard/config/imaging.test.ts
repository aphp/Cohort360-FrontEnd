import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DiagnosticReport, ImagingStudy } from 'fhir/r4'
import { CellType } from 'types/table'
import { Direction, Order } from 'types/searchCriterias'

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      ...actual.getConfig(),
      core: {
        ...actual.getConfig().core,
        valueSets: {
          ...actual.getConfig().core.valueSets,
          encounterStatus: { url: 'vs-encounter-status' }
        }
      },
      features: {
        ...actual.getConfig().features,
        imaging: {
          ...actual.getConfig().features.imaging,
          valueSets: {
            ...actual.getConfig().features.imaging.valueSets,
            imagingModalities: { url: 'vs-imaging-modalities' }
          },
          extensions: {
            ...actual.getConfig().features.imaging.extensions,
            seriesProtocolUrl: 'series-protocol-url'
          }
        }
      }
    }))
  }
})

vi.mock('services/aphp/callApi', () => ({
  fetchImaging: vi.fn()
}))

vi.mock('services/aphp/serviceValueSets', () => ({
  getCodeList: vi.fn()
}))

vi.mock('services/aphp/serviceImaging', () => ({
  linkToDiagnosticReport: vi.fn()
}))

vi.mock('utils/exploration', () => ({
  fetcherWithParams: vi.fn(),
  fetchValueSet: vi.fn(),
  getCommonParamsAll: vi.fn(() => ({ size: 0 })),
  getCommonParamsList: vi.fn(() => ({ size: 10, offset: 0, _sort: 'started', sortDirection: 'desc' })),
  narrowSearchCriterias: vi.fn((_, criterias) => criterias),
  resolveAdditionalInfos: vi.fn(async () => ({}))
}))

vi.mock('utils/fhir', () => ({
  getExtension: vi.fn()
}))

import { imagingConfig } from 'components/ExplorationBoard/config/imaging'
import { fetcherWithParams } from 'utils/exploration'
import { linkToDiagnosticReport } from 'services/aphp/serviceImaging'

const mockFetcherWithParams = vi.mocked(fetcherWithParams)
const mockLinkToDiagnosticReport = vi.mocked(linkToDiagnosticReport)

const makeImagingStudy = (id: string, patientId = 'p1'): ImagingStudy => ({
  resourceType: 'ImagingStudy',
  id,
  status: 'available',
  subject: { reference: `Patient/${patientId}` }
})

describe('imaging config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('enrichit la liste avec linkToDiagnosticReport dans fetchList', async () => {
    const rawList: ImagingStudy[] = [makeImagingStudy('study-1')]
    const linkedList: ImagingStudy[] = [{ ...makeImagingStudy('study-1'), description: 'linked' }]

    mockFetcherWithParams.mockResolvedValue({
      total: 1,
      totalAllResults: 1,
      totalPatients: 1,
      totalAllPatients: 1,
      list: rawList
    } as never)

    mockLinkToDiagnosticReport.mockResolvedValue(linkedList as never)

    const config = imagingConfig(false, null, [])

    const result = await config.fetchList!(
      {
        size: 10,
        page: 1,
        searchInput: '',
        orderBy: { orderBy: Order.STUDY_DATE, orderDirection: Direction.DESC },
        includeFacets: false
      },
      {
        filters: {
          ipp: '',
          nda: '',
          modality: [],
          bodySite: '',
          durationRange: [null, null],
          executiveUnits: [],
          encounterStatus: []
        }
      }
    )

    expect(mockLinkToDiagnosticReport).toHaveBeenCalledWith(rawList, undefined)
    expect(result.list).toEqual(linkedList)
  })

  it('extrait correctement l id Binary depuis presentedForm.url avec query/hash', () => {
    const diagnosticReport: DiagnosticReport = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: { text: 'CR' },
      presentedForm: [{ contentType: 'application/pdf', url: 'https://fhir.local/Binary/pdf-123?dl=1#anchor' }]
    }

    const config = imagingConfig(false, null, [])
    const table = config.mapToTable!({
      total: 1,
      totalAllResults: 1,
      totalPatients: 1,
      totalAllPatients: 1,
      list: [
        {
          ...makeImagingStudy('study-1'),
          idPatient: 'patient-1',
          IPP: 'IPP-1',
          NDA: 'NDA-1',
          diagnosticReport,
          series: []
        } as never
      ]
    })

    const documentCell = table.rows[0].find((cell) => cell.type === CellType.DOCUMENT_VIEWER)

    expect(documentCell).toBeDefined()
    expect((documentCell?.value as { id: string }).id).toBe('pdf-123')
  })
})
