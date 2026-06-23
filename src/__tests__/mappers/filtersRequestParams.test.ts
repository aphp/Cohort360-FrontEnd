import { describe, it, expect, vi } from 'vitest'
import { mapSearchCriteriasToRequestParams } from 'mappers/filters'
import { ResourceType } from 'types/requestCriterias'
import {
  Direction,
  ImagingFilters,
  MedicationFilters,
  Order,
  SearchByTypes,
  SearchCriterias
} from 'types/searchCriterias'

const {
  PRESCRIPTION_CS,
  PRESCRIPTION_VS,
  ADMINISTRATION_CS,
  ADMINISTRATION_VS,
  MODALITY_CS,
  MODALITY_VS,
  ENCOUNTER_STATUS_CS,
  ENCOUNTER_STATUS_VS
} = vi.hoisted(() => ({
  PRESCRIPTION_CS: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-medicament-type-prescription',
  PRESCRIPTION_VS: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-medicament-type-prescription',
  ADMINISTRATION_CS: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-orbis-medicament-voie-administration',
  ADMINISTRATION_VS: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-orbis-medicament-voie-administration',
  MODALITY_CS: 'https://dicom.nema.org/CodeSystem/modality',
  MODALITY_VS: 'https://dicom.nema.org/ValueSet/modality',
  ENCOUNTER_STATUS_CS: 'http://hl7.org/fhir/CodeSystem/encounter-status',
  ENCOUNTER_STATUS_VS: 'http://hl7.org/fhir/ValueSet/encounter-status'
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      system: { fhirUrl: 'http://localhost/fhir' },
      core: {
        valueSets: {
          encounterStatus: {
            url: ENCOUNTER_STATUS_VS,
            codeSystemUrls: [ENCOUNTER_STATUS_CS],
            resourceType: 'CodeSystem'
          }
        }
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
        imaging: {
          valueSets: {
            imagingModalities: { url: MODALITY_VS, codeSystemUrls: [MODALITY_CS], resourceType: 'CodeSystem' }
          }
        }
      }
    }))
  }
})

vi.mock('services/aphp/serviceValueSets', () => ({
  HIERARCHY_ROOT: '*',
  getChildrenFromCodes: vi.fn(),
  getCodeList: vi.fn(),
  getHierarchyRoots: vi.fn()
}))

vi.mock('services/aphp/servicePerimeters', () => ({ default: {} }))

const orderBy = { orderBy: Order.DATE, orderDirection: Direction.DESC }

const baseGeneric = {
  durationRange: [null, null] as [null, null],
  executiveUnits: [],
  encounterStatus: []
}

describe('mapSearchCriteriasToRequestParams - CodeSystem vs ValueSet system url', () => {
  it('uses the CodeSystem url for prescription types (category)', () => {
    const criterias: SearchCriterias<MedicationFilters> = {
      searchBy: SearchByTypes.TEXT,
      searchInput: '',
      orderBy,
      filters: { ...baseGeneric, code: [], prescriptionTypes: [{ id: '172641', label: 'X' }] }
    }
    const result = mapSearchCriteriasToRequestParams(criterias, ResourceType.MEDICATION_REQUEST, false)
    expect(result).toContain(`category=${encodeURIComponent(`${PRESCRIPTION_CS}|172641`)}`)
    expect(result).not.toContain(encodeURIComponent(PRESCRIPTION_VS))
  })

  it('uses the CodeSystem url for administration routes (dosage-route)', () => {
    const criterias: SearchCriterias<MedicationFilters> = {
      searchBy: SearchByTypes.TEXT,
      searchInput: '',
      orderBy,
      filters: { ...baseGeneric, code: [], administrationRoutes: [{ id: 'IV', label: 'IV' }] }
    }
    const result = mapSearchCriteriasToRequestParams(criterias, ResourceType.MEDICATION_ADMINISTRATION, false)
    expect(result).toContain(`dosage-route=${encodeURIComponent(`${ADMINISTRATION_CS}|IV`)}`)
    expect(result).not.toContain(encodeURIComponent(ADMINISTRATION_VS))
  })

  it('uses the CodeSystem url for imaging modalities', () => {
    const criterias: SearchCriterias<ImagingFilters> = {
      searchBy: SearchByTypes.TEXT,
      searchInput: '',
      orderBy,
      filters: { ...baseGeneric, modality: [{ id: 'CT', label: 'CT' }], bodySite: '' }
    }
    const result = mapSearchCriteriasToRequestParams(criterias, ResourceType.IMAGING, false)
    expect(result).toContain(`modality=${encodeURIComponent(`${MODALITY_CS}|CT`)}`)
    expect(result).not.toContain(encodeURIComponent(MODALITY_VS))
  })

  it('uses the CodeSystem url for encounter status (generic filter)', () => {
    const criterias: SearchCriterias<MedicationFilters> = {
      searchBy: SearchByTypes.TEXT,
      searchInput: '',
      orderBy,
      filters: { ...baseGeneric, code: [], encounterStatus: [{ id: 'finished', label: 'Finished' }] }
    }
    const result = mapSearchCriteriasToRequestParams(criterias, ResourceType.MEDICATION_REQUEST, false)
    expect(result).toContain(`encounter.status=${encodeURIComponent(`${ENCOUNTER_STATUS_CS}|finished`)}`)
    expect(result).not.toContain(encodeURIComponent(ENCOUNTER_STATUS_VS))
  })
})
