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
      core: { fhir: { filterActive: false, facetsExtensions: false }, valueSets: {} },
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

vi.mock('./serviceFhirConfig', () => ({
  hasSearchParam: vi.fn(() => true)
}))

import { fetchMedicationRequest, fetchMedicationAdministration, fetchImaging } from 'services/aphp/callApi'

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
    await fetchImaging({ modalities: ['CT'], minDate: null, maxDate: null })
    const params = getParams()
    expect(params).toContain(`modality=${encodeURIComponent(`${MODALITY_CS}|CT`)}`)
    expect(params.join('&')).not.toContain(encodeURIComponent(MODALITY_VS))
  })
})
