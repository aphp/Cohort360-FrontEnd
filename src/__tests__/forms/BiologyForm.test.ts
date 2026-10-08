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
      loadingMode: 'expand',
      joinDisplayWithCode: false,
      joinDisplayWithSystem: false
    }))
  )
}))

import { form } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'

const getItems = () => form().itemSections.flatMap((section) => section.items)

const getItem = (valueKey: string) => {
  const item = getItems().find((item) => item.valueKey === valueKey)
  if (!item) throw new Error(`${valueKey} item not found in BiologyForm`)
  return item
}

const getExtraLabel = (item: ReturnType<typeof getItem>) =>
  typeof item.extraLabel === 'function' ? item.extraLabel({}, {} as never) : item.extraLabel

const getCodeSearchItem = () => {
  const items = getItems()
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

  it('no longer exposes the fields linked to the stay', () => {
    const items = getItems()
    const valueKeys = items.map((item) => item.valueKey)
    for (const valueKey of [
      'encounterStatus',
      'encounterAgeRange',
      'encounterService',
      'encounterStartDate',
      'encounterEndDate'
    ]) {
      expect(valueKeys).not.toContain(valueKey)
    }
    expect(items.some((item) => item.buildInfo?.fhirKey?.toString().startsWith('encounter.'))).toBe(false)
    const labels = items.map((item) => item.label)
    for (const label of [
      'Statut de la visite associée',
      'Âge au début de la prise en charge',
      'Unité exécutrice',
      'Début de prise en charge',
      'Fin de prise en charge'
    ]) {
      expect(labels).not.toContain(label)
    }
  })

  it("keeps 'Date de l'examen' on the date FHIR key", () => {
    const item = getItem('startOccurrence')
    expect(getExtraLabel(item)).toBe("Date de l'examen")
    expect(item.buildInfo?.fhirKey).toBe('date')
  })
})
