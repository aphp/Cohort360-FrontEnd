import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  PRESCRIPTION_CS,
  PRESCRIPTION_VS,
  ADMINISTRATION_CS,
  ADMINISTRATION_VS,
  MODALITY_CS,
  MODALITY_VS
} = vi.hoisted(() => ({
  PRESCRIPTION_CS: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-medicament-type-prescription',
  PRESCRIPTION_VS: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-medicament-type-prescription',
  ADMINISTRATION_CS: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-orbis-medicament-voie-administration',
  ADMINISTRATION_VS: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-orbis-medicament-voie-administration',
  MODALITY_CS: 'https://dicom.nema.org/CodeSystem/modality',
  MODALITY_VS: 'https://dicom.nema.org/ValueSet/modality'
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      system: { fhirUrl: 'http://localhost/fhir' },
      core: {
        fhir: { filterActive: false, facetsExtensions: false },
        valueSets: {},
        codeSystems: { docStatus: 'doc-status-cs' }
      },
      features: {
        medication: {
          valueSets: {
            medicationPrescriptionTypes: {
              url: PRESCRIPTION_VS,
              codeSystemUrls: [PRESCRIPTION_CS],
              resourceType: 'CodeSystem'
            },
            medicationAdministrations: {
              url: ADMINISTRATION_VS,
              codeSystemUrls: [ADMINISTRATION_CS],
              resourceType: 'CodeSystem'
            }
          }
        },
        observation: {
          useObservationValueRestriction: false,
          useObservationDefaultValidated: false
        },
        questionnaires: {
          defaultFilterFormNames: []
        },
        imaging: {
          valueSets: {
            imagingModalities: { url: MODALITY_VS, codeSystemUrls: [MODALITY_CS], resourceType: 'CodeSystem' }
          }
        }
      }
    }))
  }
})

const fhirSearchMock = vi.fn().mockResolvedValue({ data: {} })

vi.mock('services/apiFhir', () => ({
  default: { post: vi.fn(), interceptors: { request: { use: vi.fn() } } },
  fhirSearch: (...args: unknown[]) => fhirSearchMock(...args),
  addRequestConfigHook: vi.fn(),
  getAuthorizationMethod: vi.fn()
}))

vi.mock('services/aphp/serviceFhirConfig', () => ({
  hasSearchParam: vi.fn(() => true)
}))

import {
  fetchMedicationRequest,
  fetchMedicationAdministration,
  fetchImaging,
  fetchObservation,
  fetchCondition,
  fetchProcedure,
  fetchClaim,
  fetchForms,
  fetchDocumentReference
} from 'services/aphp/callApi'

const getParams = (): string[] => fhirSearchMock.mock.calls[0][1] as string[]

describe('callApi search filters - CodeSystem vs ValueSet system url', () => {
  beforeEach(() => {
    fhirSearchMock.mockClear()
  })

  it('fetchMedicationRequest builds category with the CodeSystem url', async () => {
    await fetchMedicationRequest({ type: ['172641'], minDate: null, maxDate: null })
    const params = getParams()
    expect(params).toContain(`category=${encodeURIComponent(`${PRESCRIPTION_CS}|172641`)}`)
    expect(params.join('&')).not.toContain(encodeURIComponent(PRESCRIPTION_VS))
  })

  it('fetchMedicationAdministration builds dosage-route with the CodeSystem url', async () => {
    await fetchMedicationAdministration({ route: ['IV'], minDate: null, maxDate: null })
    const params = getParams()
    expect(params).toContain(`dosage-route=${encodeURIComponent(`${ADMINISTRATION_CS}|IV`)}`)
    expect(params.join('&')).not.toContain(encodeURIComponent(ADMINISTRATION_VS))
  })

  it('fetchImaging builds modality with the CodeSystem url', async () => {
    await fetchImaging({ modalities: ['CT'] })
    const params = getParams()
    expect(params).toContain(`modality=${encodeURIComponent(`${MODALITY_CS}|CT`)}`)
    expect(params.join('&')).not.toContain(encodeURIComponent(MODALITY_VS))
  })
})

describe('callApi _include parameter', () => {
  beforeEach(() => {
    fhirSearchMock.mockClear()
  })

  it('fetchImaging adds encoded _include params when provided', async () => {
    await fetchImaging({ _include: ['Encounter:encounter', 'Patient:patient'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:patient')}`)
  })

  it('fetchImaging does not add any _include param when omitted', async () => {
    await fetchImaging({ modalities: ['CT'] })
    const params = getParams()
    expect(params.some((p) => p.startsWith('_include='))).toBe(false)
  })

  it('fetchObservation supports Patient:subject include', async () => {
    await fetchObservation({ rowStatus: false, _include: ['Encounter:encounter', 'Patient:subject'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('fetchMedicationAdministration supports Encounter:context include', async () => {
    await fetchMedicationAdministration({
      minDate: null,
      maxDate: null,
      _include: ['Encounter:context', 'Patient:subject']
    })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:context')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('deduplicates repeated _include values', async () => {
    await fetchImaging({
      _include: ['Encounter:encounter', 'Encounter:encounter', 'Patient:patient'] as never
    })
    const params = getParams()
    const includeParams = params.filter((p) => p.startsWith('_include='))
    expect(includeParams).toHaveLength(2)
  })

  it('fetchCondition adds _include params when provided', async () => {
    await fetchCondition({ _include: ['Encounter:encounter', 'Patient:subject'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('fetchProcedure adds _include params when provided', async () => {
    await fetchProcedure({ _include: ['Encounter:encounter', 'Patient:subject'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('fetchClaim adds _include params when provided', async () => {
    await fetchClaim({ _include: ['Encounter:encounter', 'Patient:patient'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:patient')}`)
  })

  it('fetchMedicationRequest adds _include params when provided', async () => {
    await fetchMedicationRequest({
      minDate: null,
      maxDate: null,
      _include: ['Encounter:encounter', 'Patient:subject']
    })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('fetchForms adds _include params when provided', async () => {
    await fetchForms({ _include: ['Encounter:encounter', 'Patient:subject'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('fetchDocumentReference adds _include params via the shared helper', async () => {
    await fetchDocumentReference({ _include: ['Encounter:encounter', 'Patient:patient'] })
    const params = getParams()
    expect(params).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(params).toContain(`_include=${encodeURIComponent('Patient:patient')}`)
  })
})
