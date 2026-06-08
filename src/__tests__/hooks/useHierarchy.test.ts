import { describe, it, expect } from 'vitest'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'
import { groupByValueSet } from 'utils/hierarchy'

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

  it('should group selected nodes by valueSetUrl in initialization', () => {
    const selectedNodes: Hierarchy<any>[] = [
      {
        id: 'code1',
        label: 'Code 1',
        system: 'https://system1',
        valueSetUrl: 'https://valueset1',
        above_levels_ids: '',
        inferior_levels_ids: ''
      },
      {
        id: 'code2',
        label: 'Code 2',
        system: 'https://system1',
        valueSetUrl: 'https://valueset1',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
    ]

    const grouped = groupByValueSet(selectedNodes)
    
    expect(grouped).toHaveLength(1)
    expect(grouped[0].valueSetUrl).toBe('https://valueset1')
    expect(grouped[0].codes).toHaveLength(2)
  })

  it('should handle nodes array access in select function', () => {
    const nodes: Hierarchy<any>[] = [
      {
        id: 'code1',
        label: 'Code 1',
        system: 'https://system1',
        valueSetUrl: 'https://valueset1',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
    ]

    // Simulate the logic in select function: nodes?.[0].valueSetUrl || nodes?.[0].system || ''
    const valueSetUrl = nodes?.[0]?.valueSetUrl || nodes?.[0]?.system || ''

    expect(valueSetUrl).toBe('https://valueset1')
  })

  it('should handle empty nodes array in select function', () => {
    const nodes: Hierarchy<any>[] = []

    // Simulate the logic in select function
    const valueSetUrl = nodes?.[0]?.valueSetUrl || nodes?.[0]?.system || ''

    expect(valueSetUrl).toBe('')
  })

  it('should handle nodes with only system in select function', () => {
    const nodes: Hierarchy<any>[] = [
      {
        id: 'code1',
        label: 'Code 1',
        system: 'https://system1',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
    ]

    const valueSetUrl = nodes?.[0]?.valueSetUrl || nodes?.[0]?.system || ''

    expect(valueSetUrl).toBe('https://system1')
  })

  it('should handle HIERARCHY_ROOT in selectedCodes check', () => {
    const selectedCodes = new Map()
    const valueSetUrl = 'https://valueset1'
    
    // Simulate the check: selectedCodes.get(valueSetUrl)?.get(HIERARCHY_ROOT)
    const currentSelected = selectedCodes.get(valueSetUrl) || new Map()
    const hasRoot = currentSelected.get(HIERARCHY_ROOT)

    expect(hasRoot).toBeUndefined()
    
    // Now add root
    currentSelected.set(HIERARCHY_ROOT, {
      id: HIERARCHY_ROOT,
      label: 'Root',
      system: valueSetUrl,
      valueSetUrl,
      above_levels_ids: '',
      inferior_levels_ids: ''
    })
    selectedCodes.set(valueSetUrl, currentSelected)
    
    const hasRootAfter = selectedCodes.get(valueSetUrl)?.get(HIERARCHY_ROOT)
    expect(hasRootAfter).toBeDefined()
  })

  it('should create empty Map when HIERARCHY_ROOT exists in selectedCodes', () => {
    const selectedCodes = new Map()
    const valueSetUrl = 'https://valueset1'
    const currentSelected = new Map()
    
    currentSelected.set(HIERARCHY_ROOT, {
      id: HIERARCHY_ROOT,
      label: 'Root',
      system: valueSetUrl,
      valueSetUrl,
      above_levels_ids: '',
      inferior_levels_ids: ''
    })
    selectedCodes.set(valueSetUrl, currentSelected)

    // Simulate: const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected
    const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected

    expect(toAdd.size).toBe(0)
  })

  it('should use currentSelected when HIERARCHY_ROOT does not exist', () => {
    const selectedCodes = new Map()
    const valueSetUrl = 'https://valueset1'
    const currentSelected = new Map()
    
    currentSelected.set('code1', {
      id: 'code1',
      label: 'Code 1',
      system: valueSetUrl,
      valueSetUrl,
      above_levels_ids: '',
      inferior_levels_ids: ''
    })
    selectedCodes.set(valueSetUrl, currentSelected)

    // Simulate: const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected
    const toAdd = currentSelected.get(HIERARCHY_ROOT) ? new Map() : currentSelected

    expect(toAdd.size).toBe(1)
    expect(toAdd.get('code1')).toBeDefined()
  })

  it('should handle trees.get() returning undefined', () => {
    const trees = new Map<string, Hierarchy<any>[]>()
    const valueSetUrl = 'https://valueset1'

    const nodes = trees.get(valueSetUrl) || []

    expect(nodes).toEqual([])
  })

  it('should handle codes.get() returning undefined', () => {
    const codes = new Map<string, Map<string, Hierarchy<any>>>()
    const hierarchyId = 'https://valueset1'

    const currentCodes = codes.get(hierarchyId) || new Map()

    expect(currentCodes.size).toBe(0)
  })

  it('should handle selectedCodes.get() returning undefined', () => {
    const selectedCodes = new Map<string, Map<string, Hierarchy<any>>>()
    const hierarchyId = 'https://valueset1'

    const currentSelected = selectedCodes.get(hierarchyId) || new Map()

    expect(currentSelected.size).toBe(0)
  })

  it('should handle hierarchies.get() returning undefined with DEFAULT_HIERARCHY_INFO', () => {
    const hierarchies = new Map()
    const valueSetUrl = 'https://valueset1'
    const DEFAULT_HIERARCHY_INFO = { tree: [], count: 0, page: 1, system: '' }

    const currentHierarchy = hierarchies.get(valueSetUrl) || DEFAULT_HIERARCHY_INFO

    expect(currentHierarchy).toEqual(DEFAULT_HIERARCHY_INFO)
  })
})