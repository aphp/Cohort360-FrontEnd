import { beforeEach, describe, expect, it, vi } from 'vitest'

const criteriaMocks = vi.hoisted(() => ({ getAllCriteriaItems: vi.fn() }))
const valueSetMocks = vi.hoisted(() => ({
  getValueSetFromCodeSystem: vi.fn(),
  expandStoredCodesInCache: vi.fn()
}))

vi.mock('components/CreationCohort/DataList_Criteria', () => criteriaMocks)
vi.mock('utils/valueSets', () => valueSetMocks)
vi.mock('services/aphp/serviceValueSets', () => ({ getChildrenFromCodes: vi.fn(), HIERARCHY_ROOT: '__ROOT__' }))

import { healCriteriaCodes } from 'utils/cohortCreation'

const ccamDefinition = {
  id: 'PROC',
  formDefinition: {
    itemSections: [{ items: [{ type: 'codeSearch', valueKey: 'code', valueSetsInfo: [{ url: 'https://ccam-vs' }] }] }]
  }
}

describe('healCriteriaCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    criteriaMocks.getAllCriteriaItems.mockReturnValue([ccamDefinition])
    valueSetMocks.expandStoredCodesInCache.mockImplementation((codes: any[]) =>
      codes.flatMap((code) =>
        code.id === '000742' ? [{ id: '000742.....', system: 'https://ccam-vs', label: 'noeud' }] : [code]
      )
    )
  })

  it('rewrites a re-encoded CCAM code and returns a new criteria array', () => {
    const selectedCriteria = [{ type: 'PROC', code: [{ id: '000742', system: 'https://atih' }] }] as any

    const healed = healCriteriaCodes([] as any, selectedCriteria, {} as any) as any[]

    expect(healed).not.toBe(selectedCriteria)
    expect(healed[0].code[0].id).toBe('000742.....')
    expect(healed[0].code[0].system).toBe('https://ccam-vs')
  })

  it('returns the same reference when nothing changes (idempotent)', () => {
    const selectedCriteria = [{ type: 'PROC', code: [{ id: '000742.....', system: 'https://ccam-vs' }] }] as any

    expect(healCriteriaCodes([] as any, selectedCriteria, {} as any)).toBe(selectedCriteria)
  })

  it('leaves criteria without a matching definition untouched', () => {
    const selectedCriteria = [{ type: 'UNKNOWN', code: [{ id: '000742', system: 'https://atih' }] }] as any

    expect(healCriteriaCodes([] as any, selectedCriteria, {} as any)).toBe(selectedCriteria)
  })

  it('skips codeSearch fields with no selected value', () => {
    const selectedCriteria = [{ type: 'PROC', code: [] }] as any

    expect(healCriteriaCodes([] as any, selectedCriteria, {} as any)).toBe(selectedCriteria)
  })

  it('expands a wildcard CCAM code into its declensions', () => {
    valueSetMocks.expandStoredCodesInCache.mockImplementation((codes: any[]) =>
      codes.flatMap((code) =>
        code.id === 'JQGA004*'
          ? [
              { id: 'JQGA004...01', system: 'https://ccam-vs', label: '01' },
              { id: 'JQGA004-1201', system: 'https://ccam-vs', label: '1201' },
              code
            ]
          : [code]
      )
    )
    const selectedCriteria = [{ type: 'PROC', code: [{ id: 'JQGA004*', system: 'https://ccam-vs' }] }] as any

    const healed = healCriteriaCodes([] as any, selectedCriteria, {} as any) as any[]

    expect(healed[0].code.map((c: any) => c.id)).toEqual(['JQGA004...01', 'JQGA004-1201', 'JQGA004*'])
  })
})
