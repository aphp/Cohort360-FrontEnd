import { describe, it, expect } from 'vitest'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

describe('useSearchValueSet - valueSetUrl handling', () => {
  it('should use valueSetUrl when checking if selection is disabled', () => {
    const node: Hierarchy<FhirItem> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const selectedCodes = new Map([
      ['https://valueset1', new Map([[HIERARCHY_ROOT, { id: HIERARCHY_ROOT } as any]])]
    ])

    const nodeKey = node.valueSetUrl || node.system
    const isAll = selectedCodes.get(nodeKey)?.get(HIERARCHY_ROOT)

    expect(nodeKey).toBe('https://valueset1')
    expect(isAll).toBeDefined()
  })

  it('should fallback to system when valueSetUrl is not available', () => {
    const node: Hierarchy<FhirItem> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const selectedCodes = new Map([['https://system1', new Map([[HIERARCHY_ROOT, { id: HIERARCHY_ROOT } as any]])]])

    const nodeKey = node.valueSetUrl || node.system
    const isAll = selectedCodes.get(nodeKey)?.get(HIERARCHY_ROOT)

    expect(nodeKey).toBe('https://system1')
    expect(isAll).toBeDefined()
  })

  it('should use valueSetUrl in handleDeleteSelectedCodes for root', () => {
    const code: Hierarchy<FhirItem> = {
      id: HIERARCHY_ROOT,
      label: 'Toute la hiérarchie',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const isRoot = code.id === HIERARCHY_ROOT
    const codeKey = code.valueSetUrl || code.system

    expect(isRoot).toBe(true)
    expect(codeKey).toBe('https://valueset1')
  })

  it('should use valueSetUrl in handleDeleteSelectedCodes for non-root', () => {
    const code: Hierarchy<FhirItem> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const isRoot = code.id === HIERARCHY_ROOT
    const codeKey = code.valueSetUrl || code.system

    expect(isRoot).toBe(false)
    expect(codeKey).toBe('https://valueset1')
  })

  it('should use valueSetUrl in initExploration', () => {
    const reference = {
      id: 'ref1',
      url: 'https://valueset1',
      label: 'ValueSet 1',
      title: 'ValueSet 1 Title',
      standard: true,
      checked: false,
      isHierarchy: true,
      joinDisplayWithCode: false,
      joinDisplayWithSystem: false
    }

    const initHandler = {
      valueSetUrl: reference.url,
      fetchBaseTree: () => Promise.resolve({ results: [], count: 0 })
    }

    expect(initHandler.valueSetUrl).toBe('https://valueset1')
  })

  it('should prioritize valueSetUrl over system', () => {
    const node: Hierarchy<FhirItem> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const nodeKey = node.valueSetUrl || node.system

    expect(nodeKey).toBe('https://valueset1')
    expect(nodeKey).not.toBe('https://system1')
  })

  it('should handle empty valueSetUrl and system', () => {
    const node: Hierarchy<FhirItem> = {
      id: 'code1',
      label: 'Code 1',
      system: '',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const nodeKey = node.valueSetUrl || node.system

    expect(nodeKey).toBe('')
  })
})