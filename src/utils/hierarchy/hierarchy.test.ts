// Importer les types nécessaires et la fonction à tester
import { Hierarchy, Mode } from 'types/hierarchy'
import { buildTree } from './hierarchy' // Remplacez par le chemin réel

// Mock des fonctions utilisées dans buildTree
import { getMissingNode, getMissingSubItems, getItemSelectedStatus, updateBranchStatus } from './hierarchy'
import { SelectedStatus } from 'types'

/*jest.mock('./path_to_your_file', () => ({
  ...jest.requireActual('./path_to_your_file'),
  getMissingNode: jest.fn((key, node, codes) => node),
  getMissingSubItems: jest.fn((node, codes) => []),
  getItemSelectedStatus: jest.fn((node) => SelectedStatus.NOT_SELECTED),
  updateBranchStatus: jest.fn((node, status) => {})
}))*/

describe('buildTree', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly build the tree with Mode.EXPAND', () => {
    const baseTree: Hierarchy<{}, string>[] = [
      {
        id: '1',

        label: 'root',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system: 'system1',
        subItems: []
      }
    ]

    const endCodes: Hierarchy<{}, string>[] = []
    const codes = new Map<string, Hierarchy<{}, string>>()
    const selected: Hierarchy<{}, string>[] = []

    const result = buildTree(baseTree, endCodes, codes, selected, Mode.EXPAND)

    expect(result).toEqual(baseTree)
    expect(getMissingNode).toHaveBeenCalled()
    expect(getMissingSubItems).toHaveBeenCalled()
  })

  it('should correctly handle Mode.SELECT', () => {
    const baseTree: Hierarchy<{}, string>[] = [
      {
        id: '1',
        label: 'root',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system: 'system1',
        subItems: []
      }
    ]

    const endCodes: Hierarchy<{}, string>[] = []
    const codes = new Map<string, Hierarchy<{}, string>>()
    const selected: Hierarchy<{}, string>[] = []

    const result = buildTree(baseTree, endCodes, codes, selected, Mode.SELECT)

    expect(result[0].status).toBe(SelectedStatus.SELECTED)
    expect(getMissingNode).toHaveBeenCalled()
  })

  it('should correctly handle Mode.UNSELECT', () => {
    const baseTree: Hierarchy<{}, string>[] = [
      {
        id: '1',

        label: 'root',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system: 'system1',
        subItems: [],
        status: SelectedStatus.SELECTED
      }
    ]

    const endCodes: Hierarchy<{}, string>[] = []
    const codes = new Map<string, Hierarchy<{}, string>>()
    const selected: Hierarchy<{}, string>[] = []

    const result = buildTree(baseTree, endCodes, codes, selected, Mode.UNSELECT)

    expect(result[0].status).toBe(SelectedStatus.NOT_SELECTED)
    expect(getMissingNode).toHaveBeenCalled()
  })

  it('should correctly handle Mode.SEARCH', () => {
    const baseTree: Hierarchy<{}, string>[] = [
      {
        id: '1',

        label: 'root',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system: 'system1',
        subItems: []
      }
    ]

    const endCodes: Hierarchy<{}, string>[] = []
    const codes = new Map<string, Hierarchy<{}, string>>()
    const selected: Hierarchy<{}, string>[] = [
      {
        id: '1',

        label: 'root',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system: 'system1',
        status: SelectedStatus.SELECTED,
        subItems: []
      }
    ]

    const result = buildTree(baseTree, endCodes, codes, selected, Mode.SEARCH)

    expect(result[0].status).toBe(SelectedStatus.SELECTED)
    expect(updateBranchStatus).toHaveBeenCalledWith(result[0], SelectedStatus.SELECTED)
  })

  // Ajoutez d'autres tests selon vos besoins...
})
