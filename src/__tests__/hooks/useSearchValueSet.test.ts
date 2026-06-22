import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchMode, type Hierarchy } from 'types/hierarchy'
import { References, type FhirItem, type Reference } from 'types/valueSet'

const HIERARCHY_ROOT = '*'

// useHierarchy is stubbed so we can drive `selectedCodes` and assert how the hook
// keys into it / which actions it triggers — i.e. the real valueSetUrl logic of useSearchValueSet.
const hierarchyStub = vi.hoisted(() => ({
  selectedCodes: new Map<string, Map<string, Hierarchy<FhirItem>>>(),
  select: vi.fn(),
  selectAll: vi.fn()
}))

vi.mock('services/aphp/serviceValueSets', () => ({
  HIERARCHY_ROOT: '*',
  UNKOWN_HIERARCHY_CHAPTER: 'UNKNOWN',
  getChildrenFromCodes: vi.fn(async () => ({ results: [], count: 0 })),
  getHierarchyRoots: vi.fn(async () => ({ results: [], count: 0 })),
  searchInValueSets: vi.fn(async () => ({ results: [], count: 0 }))
}))

vi.mock('state', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: () => new Map()
}))

vi.mock('state/valueSets', () => ({
  saveValueSets: vi.fn(),
  selectValueSetCodes: vi.fn(() => new Map())
}))

vi.mock('hooks/hierarchy/useHierarchy', () => ({
  useHierarchy: () => ({
    hierarchies: new Map(),
    searchResults: { tree: [], count: 0, page: 1, system: '' },
    selectedCodes: hierarchyStub.selectedCodes,
    loadingStatus: { search: 'success', expand: 'success' },
    hasError: false,
    initTrees: vi.fn(),
    fetchMore: vi.fn(),
    expand: vi.fn(),
    select: hierarchyStub.select,
    selectAll: hierarchyStub.selectAll
  })
}))

import { useSearchValueSet } from 'hooks/valueSet/useSearchValueSet'

const VALUESET_URL = 'https://terminology.hl7.org/ValueSet/biology-anabio'
const CODESYSTEM_URL = 'https://terminology.hl7.org/CodeSystem/biology-anabio'

const mkRef = (overrides: Partial<Reference> = {}): Reference => ({
  id: References.ANABIO,
  url: VALUESET_URL,
  label: 'Anabio',
  title: 'Anabio',
  standard: true,
  checked: true,
  isHierarchy: true,
  joinDisplayWithCode: false,
  joinDisplayWithSystem: false,
  ...overrides
})

const mkNode = (overrides: Partial<Hierarchy<FhirItem>> = {}): Hierarchy<FhirItem> => ({
  id: 'code1',
  label: 'Code 1',
  system: CODESYSTEM_URL,
  above_levels_ids: '',
  inferior_levels_ids: '',
  ...overrides
})

const rootSelected = (key: string) => new Map([[key, new Map([[HIERARCHY_ROOT, mkNode({ id: HIERARCHY_ROOT })]])]])

const renderUseSearchValueSet = () => renderHook(() => useSearchValueSet([mkRef()], []))

beforeEach(() => {
  vi.clearAllMocks()
  hierarchyStub.selectedCodes = new Map()
})

describe('useSearchValueSet - isSelectionDisabled', () => {
  it('disables selection in RESEARCH mode when the node valueSet has "select all" active', () => {
    hierarchyStub.selectedCodes = rootSelected(VALUESET_URL)
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onChangeMode(SearchMode.RESEARCH))

    expect(result.current.isSelectionDisabled(mkNode({ valueSetUrl: VALUESET_URL }))).toBe(true)
  })

  it('keys into selectedCodes by valueSetUrl, not by system', () => {
    // "select all" is registered under the ValueSet URL; the node also carries a different CodeSystem URL.
    hierarchyStub.selectedCodes = rootSelected(VALUESET_URL)
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onChangeMode(SearchMode.RESEARCH))

    expect(result.current.isSelectionDisabled(mkNode({ valueSetUrl: VALUESET_URL, system: CODESYSTEM_URL }))).toBe(true)
    // Same node without valueSetUrl falls back to system, which has no "select all" registered.
    expect(result.current.isSelectionDisabled(mkNode({ system: CODESYSTEM_URL }))).toBe(false)
  })

  it('falls back to system when the node has no valueSetUrl', () => {
    hierarchyStub.selectedCodes = rootSelected(CODESYSTEM_URL)
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onChangeMode(SearchMode.RESEARCH))

    expect(result.current.isSelectionDisabled(mkNode({ system: CODESYSTEM_URL }))).toBe(true)
  })

  it('does not disable selection when no "select all" is active', () => {
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onChangeMode(SearchMode.RESEARCH))

    expect(result.current.isSelectionDisabled(mkNode({ valueSetUrl: VALUESET_URL }))).toBe(false)
  })
})

describe('useSearchValueSet - onDelete', () => {
  it('unselects all using the valueSetUrl (not the system) for a root code', () => {
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onDelete(mkNode({ id: HIERARCHY_ROOT, valueSetUrl: VALUESET_URL, system: CODESYSTEM_URL })))

    expect(hierarchyStub.selectAll).toHaveBeenCalledWith(VALUESET_URL, false)
    expect(hierarchyStub.select).not.toHaveBeenCalled()
  })

  it('unselects a single non-root code via select()', () => {
    const node = mkNode({ valueSetUrl: VALUESET_URL })
    const { result } = renderUseSearchValueSet()

    act(() => result.current.onDelete(node))

    expect(hierarchyStub.select).toHaveBeenCalledWith([node], false, SearchMode.EXPLORATION)
    expect(hierarchyStub.selectAll).not.toHaveBeenCalled()
  })
})
