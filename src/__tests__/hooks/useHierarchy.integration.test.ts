import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingStatus } from 'types'
import { SearchMode, type Hierarchy } from 'types/hierarchy'

const hierarchyMocks = vi.hoisted(() => ({
  buildTree: vi.fn(),
  buildMultipleTrees: vi.fn(),
  getDisplayFromTree: vi.fn(),
  getDisplayFromTrees: vi.fn(),
  getMissingCodes: vi.fn(),
  getMissingCodesWithValueSets: vi.fn(),
  groupByValueSet: vi.fn(),
  getHierarchyRootCodes: vi.fn(),
  mapHierarchyToMap: vi.fn(),
  getSelectedCodesFromTrees: vi.fn(),
  createHierarchyRoot: vi.fn(),
  DEFAULT_HIERARCHY_INFO: { tree: [], count: 0, page: 1, system: '' }
}))

const mapMocks = vi.hoisted(() => ({
  replaceInMap: vi.fn()
}))

vi.mock('utils/hierarchy', () => hierarchyMocks)
vi.mock('utils/map', () => mapMocks)

import { useHierarchy } from 'hooks/hierarchy/useHierarchy'

const mkNode = (overrides: Partial<Hierarchy<any>> = {}): Hierarchy<any> => ({
  id: 'code1',
  label: 'Code 1',
  system: 'https://system1',
  above_levels_ids: '',
  inferior_levels_ids: '',
  ...overrides
})

describe('useHierarchy integration coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    hierarchyMocks.groupByValueSet.mockReturnValue([])
    hierarchyMocks.mapHierarchyToMap.mockReturnValue(new Map())
    hierarchyMocks.buildMultipleTrees.mockImplementation((trees: Map<string, Hierarchy<any>[]>) => trees)
    hierarchyMocks.getDisplayFromTrees.mockImplementation((base: Hierarchy<any>[]) => base)
    hierarchyMocks.getDisplayFromTree.mockImplementation((base: Hierarchy<any>[]) => base)
    hierarchyMocks.getSelectedCodesFromTrees.mockImplementation(
      (newTrees: Map<string, Map<string, Hierarchy<any>>>) => newTrees
    )
    hierarchyMocks.getMissingCodesWithValueSets.mockImplementation(
      async (_trees: any, _by: any, codes: Map<string, Map<string, Hierarchy<any>>>) => codes
    )
    hierarchyMocks.getMissingCodes.mockImplementation(
      async (_tree: any, currentCodes: Map<string, Hierarchy<any>>) => currentCodes
    )
    hierarchyMocks.buildTree.mockImplementation((baseTree: Hierarchy<any>[]) => baseTree)
    hierarchyMocks.getHierarchyRootCodes.mockReturnValue(new Map())
    hierarchyMocks.createHierarchyRoot.mockImplementation((valueSetUrl: string) =>
      mkNode({ id: 'hierarchy-root', valueSetUrl, system: valueSetUrl })
    )
    mapMocks.replaceInMap.mockImplementation((key: string, value: any, source: Map<string, any>) => {
      const next = new Map(source)
      next.set(key, value)
      return next
    })
  })

  it('covers fetchMore exploration path and updates hierarchy page', async () => {
    const valueSetUrl = 'https://valueset1'
    const inputNode = mkNode({ valueSetUrl, system: valueSetUrl })

    hierarchyMocks.groupByValueSet.mockReturnValue([{ valueSetUrl, codes: [inputNode] }])

    const { result } = renderHook(() =>
      useHierarchy<any>(
        [],
        new Map(),
        vi.fn(),
        vi.fn(async () => [])
      )
    )

    await act(async () => {
      await result.current.fetchMore(
        async () => ({ results: [inputNode], count: 1 }),
        2,
        SearchMode.EXPLORATION,
        valueSetUrl
      )
    })

    expect(result.current.hasError).toBe(false)
    expect(mapMocks.replaceInMap).toHaveBeenCalled()
  })

  it('covers fetchMore research path and sets hasError when display contains undefined', async () => {
    const valueSetUrl = 'https://valueset2'
    const inputNode = mkNode({ id: 'code2', valueSetUrl, system: valueSetUrl })

    hierarchyMocks.groupByValueSet.mockReturnValue([{ valueSetUrl, codes: [inputNode] }])
    hierarchyMocks.getDisplayFromTrees.mockReturnValue([inputNode, undefined])

    const { result } = renderHook(() =>
      useHierarchy<any>(
        [],
        new Map(),
        vi.fn(),
        vi.fn(async () => [])
      )
    )

    await act(async () => {
      await result.current.fetchMore(async () => ({ results: [inputNode], count: 2 }), 1, SearchMode.RESEARCH)
    })

    expect(result.current.hasError).toBe(true)
    expect(result.current.searchResults.count).toBe(2)
  })

  it('covers select exploration and research branches', () => {
    const valueSetUrl = 'https://valueset3'
    const node = mkNode({ id: 'code3', valueSetUrl, system: valueSetUrl })

    hierarchyMocks.groupByValueSet.mockReturnValue([{ valueSetUrl, codes: [node] }])

    const { result } = renderHook(() =>
      useHierarchy<any>(
        [],
        new Map(),
        vi.fn(),
        vi.fn(async () => [])
      )
    )

    act(() => {
      result.current.select([node], true, SearchMode.EXPLORATION)
      result.current.select([node], false, SearchMode.RESEARCH)
    })

    expect(hierarchyMocks.buildMultipleTrees).toHaveBeenCalled()
    expect(hierarchyMocks.getSelectedCodesFromTrees).toHaveBeenCalled()
  })

  it('covers selectAll and expand flows', async () => {
    const valueSetUrl = 'https://valueset4'
    const node = mkNode({ id: 'code4', valueSetUrl, system: valueSetUrl })

    hierarchyMocks.groupByValueSet.mockReturnValue([{ valueSetUrl, codes: [node] }])

    const { result } = renderHook(() =>
      useHierarchy<any>(
        [],
        new Map(),
        vi.fn(),
        vi.fn(async () => [node])
      )
    )

    act(() => {
      result.current.selectAll(valueSetUrl, true)
    })

    await act(async () => {
      await result.current.expand(node)
    })

    expect(hierarchyMocks.createHierarchyRoot).toHaveBeenCalledWith(valueSetUrl)
    expect(result.current.loadingStatus.search).toBe(LoadingStatus.SUCCESS)
  })
})
