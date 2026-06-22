import { describe, it, expect, vi } from 'vitest'

const { ANABIO_VALUESET_URL, ANABIO_CODESYSTEM_URL, LOINC_VALUESET_URL, LOINC_CODESYSTEM_URL } = vi.hoisted(() => ({
  ANABIO_VALUESET_URL: 'https://terminology.hl7.org/ValueSet/biology-anabio',
  ANABIO_CODESYSTEM_URL: 'https://terminology.hl7.org/CodeSystem/biology-anabio',
  LOINC_VALUESET_URL: 'https://terminology.hl7.org/ValueSet/biology-loinc',
  LOINC_CODESYSTEM_URL: 'https://terminology.hl7.org/CodeSystem/biology-loinc'
}))

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    system: { fhirUrl: 'https://localhost/fhir' },
    core: {
      fhir: { filterActive: true },
      valueSets: { encounterStatus: { url: 'https://terminology.hl7.org/ValueSet/encounter-status' } }
    },
    features: {
      observation: {
        useObservationDefaultValidated: true,
        useObservationValueRestriction: false,
        valueSets: {
          biologyHierarchyAnabio: { url: ANABIO_VALUESET_URL, codeSystemUrls: [ANABIO_CODESYSTEM_URL] },
          biologyHierarchyLoinc: { url: LOINC_VALUESET_URL, codeSystemUrls: [LOINC_CODESYSTEM_URL] }
        }
      }
    }
  })),
  onUpdateConfig: vi.fn()
}))

vi.mock('data/valueSets', () => ({
  getReferences: vi.fn(() =>
    [
      { url: ANABIO_VALUESET_URL, codeSystemUrls: [ANABIO_CODESYSTEM_URL], label: 'ANABIO' },
      { url: LOINC_VALUESET_URL, codeSystemUrls: [LOINC_CODESYSTEM_URL], label: 'LOINC' }
    ].map((ref) => ({
      ...ref,
      title: ref.label,
      standard: true,
      checked: true,
      isHierarchy: true,
      joinDisplayWithCode: false,
      joinDisplayWithSystem: false
    }))
  )
}))

import { form } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'

const getCodeSearchItem = () => {
  const items = form().itemSections.flatMap((section) => section.items)
  const codeSearch = items.find((item) => item.type === 'codeSearch')
  if (!codeSearch) throw new Error('codeSearch item not found in BiologyForm')
  return codeSearch as Extract<typeof codeSearch, { type: 'codeSearch' }>
}

describe('BiologyForm', () => {
  it('exposes both ValueSet URLs in valueSetsInfo (for searching/listing)', () => {
    const item = getCodeSearchItem()
    expect(item.valueSetsInfo.map((ref) => ref.url)).toEqual([ANABIO_VALUESET_URL, LOINC_VALUESET_URL])
  })

  it('uses the ANABIO CodeSystem URL in buildMethodExtraArgs (for individual codes)', () => {
    const item = getCodeSearchItem()
    expect(item.buildInfo?.buildMethodExtraArgs?.[0].value).toBe(ANABIO_CODESYSTEM_URL)
  })
})
