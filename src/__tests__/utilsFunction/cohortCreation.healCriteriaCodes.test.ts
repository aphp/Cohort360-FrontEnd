import { beforeEach, describe, expect, it, vi } from 'vitest'

const criteriaMocks = vi.hoisted(() => ({ getAllCriteriaItems: vi.fn() }))
const valueSetMocks = vi.hoisted(() => ({
  getValueSetFromCodeSystem: vi.fn(),
  matchStoredCodeInCache: vi.fn()
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
    valueSetMocks.matchStoredCodeInCache.mockImplementation((code: any) =>
      code.id === '000742' ? { id: '000742.....', system: 'https://ccam-vs', label: 'noeud' } : code
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
})
