import { describe, it, expect, vi } from 'vitest'

const { PROCEDURE_VALUESET_URL, PROCEDURE_CODESYSTEM_URL } = vi.hoisted(() => ({
  PROCEDURE_VALUESET_URL: 'https://terminology.hl7.org/ValueSet/procedure-ccam',
  PROCEDURE_CODESYSTEM_URL: 'https://terminology.hl7.org/CodeSystem/procedure-ccam'
}))

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    system: { fhirUrl: 'https://localhost/fhir' },
    core: {
      fhir: { filterActive: true },
      valueSets: { encounterStatus: { url: 'https://terminology.hl7.org/ValueSet/encounter-status' } }
    },
    features: {
      procedure: {
        valueSets: {
          procedureHierarchy: { url: PROCEDURE_VALUESET_URL, codeSystemUrls: [PROCEDURE_CODESYSTEM_URL] }
        },
        filters: { sources: { arem: 'AREM', orbis: 'ORBIS' } }
      }
    }
  })),
  onUpdateConfig: vi.fn()
}))

vi.mock('data/valueSets', () => ({
  getReferences: vi.fn(() => [
    {
      url: PROCEDURE_VALUESET_URL,
      codeSystemUrls: [PROCEDURE_CODESYSTEM_URL],
      label: 'CCAM',
      title: 'CCAM',
      standard: true,
      checked: true,
      isHierarchy: true,
      joinDisplayWithCode: true,
      joinDisplayWithSystem: false
    }
  ])
}))

import { form } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'

const getCodeSearchItem = () => {
  const items = form().itemSections.flatMap((section) => section.items)
  const codeSearch = items.find((item) => item.type === 'codeSearch')
  if (!codeSearch) throw new Error('codeSearch item not found in CCAMForm')
  return codeSearch as Extract<typeof codeSearch, { type: 'codeSearch' }>
}

describe('CCAMForm', () => {
  it('exposes the ValueSet URL in valueSetsInfo (for searching/listing)', () => {
    const item = getCodeSearchItem()
    expect(item.valueSetsInfo.map((ref) => ref.url)).toEqual([PROCEDURE_VALUESET_URL])
  })

  it('uses the CodeSystem URL in buildMethodExtraArgs (for individual codes)', () => {
    const item = getCodeSearchItem()
    expect(item.buildInfo?.buildMethodExtraArgs?.[0].value).toBe(PROCEDURE_CODESYSTEM_URL)
  })
})
