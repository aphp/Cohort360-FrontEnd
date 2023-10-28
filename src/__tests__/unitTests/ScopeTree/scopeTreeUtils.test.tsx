import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllParentsIds, getHeadCells, getParents } from '../../../components/ScopeTree/utils/scopeTreeUtils'
import servicesPerimeters from '../../../services/aphp/servicePerimeters'
import { ScopeTreeRow, ScopeTreeTableHeadCellsType } from '../../../types'
import { CheckBox } from '@mui/icons-material'

describe('getParents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.mock('../../../services/aphp/servicePerimeters', () => {
      return {
        default: {
          getPerimeters: vi.fn(),
          buildScopeTreeRowList: vi.fn()
        }
      }
    })
    vi.mock('../../../components/ScopeTree/utils/scopeTreeUtils', async () => {
      const actual: any = await vi.importActual('../../../components/ScopeTree/utils/scopeTreeUtils')
      return {
        ...actual
      }
    })
  })

  const rootRows = [
    {
      id: '1',
      name: 'Parent 1',
      quantity: 1,
      subItems: [
        {
          id: '2',
          name: 'Child 1',
          quantity: 1,
          subItems: []
        }
      ]
    },
    {
      id: '3',
      name: 'Parent 2',
      quantity: 1,
      subItems: []
    }
  ]
  const allParentsIds = ['1', '3', '4']
  const notFetchedItems = ['4']
  const notFetchedParents = [
    {
      id: '4',
      name: '',
      quantity: 0,
      subItems: []
    }
  ]
  const perimetersMockedValue: any = []

  it('should return fetched parents and not fetched sub items when some parents are not fetched', async () => {
    vi.mocked(servicesPerimeters.buildScopeTreeRowList).mockResolvedValue(notFetchedParents)
    vi.mocked(servicesPerimeters.getPerimeters).mockResolvedValue(perimetersMockedValue)

    const result = await getParents(allParentsIds, rootRows)
    expect(result).toEqual([...rootRows, ...notFetchedParents])
    expect(servicesPerimeters.buildScopeTreeRowList).toHaveBeenCalledWith(perimetersMockedValue)
    expect(servicesPerimeters.getPerimeters).toHaveBeenCalledWith(notFetchedItems, undefined, undefined)
  })

  it('should return empty array when allParentsIds is empty', async () => {
    const result = await getParents([], rootRows)
    expect(result).toEqual([])
  })

  it('should return fetched parents when all parents are already fetched', async () => {
    const allParentsIds = ['1', '3']
    const result = await getParents(allParentsIds, rootRows)
    expect(result).toEqual([...rootRows])
  })
})
describe('getAllParentsIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.mock('../../../components/ScopeTree/utils/scopeTreeUtils', async () => {
      const actual: any = await vi.importActual('../../../components/ScopeTree/utils/scopeTreeUtils')
      return {
        ...actual
      }
    })
  })

  it('returns an array of unique parent IDs', async () => {
    const selectedItems: ScopeTreeRow[] = [
      {
        id: '1',
        subItems: [],
        name: 'Item 1',
        quantity: 1,
        above_levels_ids: '2,3'
      },
      {
        id: '2',
        subItems: [],
        name: 'Item 2',
        quantity: 2,
        above_levels_ids: '3'
      },
      {
        id: '3',
        subItems: [],
        name: 'Item 3',
        quantity: 3,
        above_levels_ids: ''
      }
    ]
    const allParentsIds = await getAllParentsIds(selectedItems)
    expect(allParentsIds).toHaveLength(2)
    expect(allParentsIds).toContain('2')
    expect(allParentsIds).toContain('3')
  })

  it('returns an empty array when selectedItems is empty', async () => {
    const selectedItems: ScopeTreeRow[] = []
    const allParentsIds = await getAllParentsIds(selectedItems)
    expect(allParentsIds).toHaveLength(0)
  })

  it('returns an empty array when no parent IDs are found', async () => {
    const selectedItems: ScopeTreeRow[] = [
      {
        id: '1',
        subItems: [],
        name: 'Item 1',
        quantity: 1,
        above_levels_ids: ''
      }
    ]
    const allParentsIds = await getAllParentsIds(selectedItems)
    expect(allParentsIds).toHaveLength(0)
  })
})
describe('getHeadCells', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.mock('../../../components/ScopeTree/utils/scopeTreeUtils', async () => {
      const actual: any = await vi.importActual('../../../components/ScopeTree/utils/scopeTreeUtils')
      return {
        ...actual
      }
    })
  })
  it('returns an array of objects', () => {
    const result = getHeadCells()
    expect(Array.isArray(result)).toBe(true)
    expect(result.every((obj) => typeof obj === 'object')).toBe(true)
  })

  it('returns an array with at least one object', () => {
    const result = getHeadCells()
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns an array with the correct properties', () => {
    const result = getHeadCells()
    const expectedProperties = ['id', 'align', 'disablePadding', 'disableOrderBy', 'label']
    expect(result.every((obj) => expectedProperties.every((prop) => prop in obj))).toBe(true)
  })

  it('returns an array with the correct labels', () => {
    const result = getHeadCells()
    const expectedLabels = ['', 'Nom', 'Nombre de patients', 'Accès']
    expect(result.map((obj) => obj.label)).toEqual(expectedLabels)
  })

  it('returns an array with a checkbox object if headCheckbox is provided', () => {
    const headCheckbox = <CheckBox></CheckBox>
    const result = getHeadCells(headCheckbox)
    expect(result.some((obj: ScopeTreeTableHeadCellsType) => obj.label === headCheckbox)).toBe(true)
  })

  it('returns an array with a deidentified object if executiveUnitType is provided', () => {
    const executiveUnitType = 'AP-HP'
    const result = getHeadCells(undefined, executiveUnitType)
    expect(result.some((obj) => obj.id === 'deidentified')).toBe(true)
  })
})
