import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Hierarchy } from 'types/hierarchy'

const servicesMocks = vi.hoisted(() => ({
  getChildrenFromCodes: vi.fn(),
  HIERARCHY_ROOT: '__HIERARCHY_ROOT__'
}))

const criteriaMocks = vi.hoisted(() => ({
  getAllCriteriaItems: vi.fn()
}))

const valueSetMocks = vi.hoisted(() => ({
  getValueSetFromCodeSystem: vi.fn()
}))

vi.mock('services/aphp/serviceValueSets', () => servicesMocks)
vi.mock('components/CreationCohort/DataList_Criteria', () => criteriaMocks)
vi.mock('utils/valueSets', () => valueSetMocks)

import { fetchCriteriasCodes } from 'utils/cohortCreation'

const mkCode = (id: string, valueSetUrl: string): Hierarchy<any> => ({
  id,
  label: id,
  system: valueSetUrl,
  valueSetUrl,
  above_levels_ids: '',
  inferior_levels_ids: ''
})

describe('fetchCriteriasCodes real module coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    criteriaMocks.getAllCriteriaItems.mockReturnValue([
      {
        id: 'TYPE_A',
        formDefinition: {
          itemSections: [
            {
              items: [
                {
                  type: 'codeSearch',
                  valueKey: 'codesA',
                  valueSetsInfo: [{ url: 'https://default-valueset' }]
                }
              ]
            }
          ]
        }
      }
    ])

    valueSetMocks.getValueSetFromCodeSystem.mockImplementation((system: string) => {
      if (system === 'https://system-mapped') return 'https://mapped-valueset'
      return undefined
    })

    servicesMocks.getChildrenFromCodes.mockImplementation(async (valueSetUrl: string, ids: string[]) => ({
      results: ids.map((id) => mkCode(id, valueSetUrl))
    }))
  })

  it('uses mapped ValueSet when CodeSystem is known', async () => {
    const selectedCriteria = [
      {
        type: 'TYPE_A',
        codesA: [{ id: 'A1', system: 'https://system-mapped' }]
      }
    ] as any

    const cache = await fetchCriteriasCodes([] as any, selectedCriteria)

    expect(cache['https://mapped-valueset']).toBeDefined()
    expect(cache['https://mapped-valueset'][0].id).toBe('A1')
  })

  it('falls back to default ValueSet when mapping is missing', async () => {
    const selectedCriteria = [
      {
        type: 'TYPE_A',
        codesA: [{ id: 'A2', system: 'https://unknown-system' }]
      }
    ] as any

    const cache = await fetchCriteriasCodes([] as any, selectedCriteria)

    expect(cache['https://default-valueset']).toBeDefined()
    expect(cache['https://default-valueset'][0].id).toBe('A2')
  })

  it('does not fetch duplicate ids already cached for same ValueSet', async () => {
    const selectedCriteria = [
      {
        type: 'TYPE_A',
        codesA: [{ id: 'A3', system: 'https://unknown-system' }]
      }
    ] as any

    const oldCache = {
      'https://default-valueset': [mkCode('A3', 'https://default-valueset')]
    }

    const cache = await fetchCriteriasCodes([] as any, selectedCriteria, oldCache as any)

    expect(servicesMocks.getChildrenFromCodes).not.toHaveBeenCalledWith('https://default-valueset', ['A3'])
    expect(cache['https://default-valueset']).toHaveLength(1)
  })

  it('stores hierarchy root without calling backend', async () => {
    const selectedCriteria = [
      {
        type: 'TYPE_A',
        codesA: [{ id: '__HIERARCHY_ROOT__', system: 'https://system-mapped' }]
      }
    ] as any

    const cache = await fetchCriteriasCodes([] as any, selectedCriteria)

    expect(servicesMocks.getChildrenFromCodes).not.toHaveBeenCalled()
    expect(cache['https://mapped-valueset'][0].id).toBe('__HIERARCHY_ROOT__')
  })
})
