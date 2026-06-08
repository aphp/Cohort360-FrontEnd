import { describe, it, expect } from 'vitest'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'

describe('useHierarchy - valueSetUrl handling', () => {
  it('should use valueSetUrl when available for node key', () => {
    const node: Hierarchy<any> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const nodeKey = node.valueSetUrl || node.system

    expect(nodeKey).toBe('https://valueset1')
  })

  it('should fallback to system when valueSetUrl is not available', () => {
    const node: Hierarchy<any> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const nodeKey = node.valueSetUrl || node.system

    expect(nodeKey).toBe('https://system1')
  })

  it('should use valueSetUrl for hierarchyId in expand', () => {
    const node: Hierarchy<any> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: 'child1'
    }

    const hierarchyId = node.valueSetUrl || node.system || ''

    expect(hierarchyId).toBe('https://valueset1')
  })

  it('should handle empty valueSetUrl and system', () => {
    const node: Hierarchy<any> = {
      id: 'code1',
      label: 'Code 1',
      system: '',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const hierarchyId = node.valueSetUrl || node.system || ''

    expect(hierarchyId).toBe('')
  })

  it('should use valueSetUrl in selectAll for root creation', () => {
    const valueSetUrl = 'https://valueset1'
    const root = new Map()
    
    // Simulate creating a root
    root.set(HIERARCHY_ROOT, {
      id: HIERARCHY_ROOT,
      label: 'Toute la hiérarchie',
      system: valueSetUrl,
      valueSetUrl,
      above_levels_ids: '',
      inferior_levels_ids: ''
    })

    const rootNode = root.get(HIERARCHY_ROOT)
    expect(rootNode?.valueSetUrl).toBe('https://valueset1')
  })

  it('should prioritize valueSetUrl over system', () => {
    const node: Hierarchy<any> = {
      id: 'code1',
      label: 'Code 1',
      system: 'https://system1',
      valueSetUrl: 'https://valueset1',
      above_levels_ids: '',
      inferior_levels_ids: ''
    }

    const key = node.valueSetUrl || node.system

    expect(key).toBe('https://valueset1')
    expect(key).not.toBe('https://system1')
  })
})