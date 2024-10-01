import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import {
  mapCodesToCache,
  mapCacheToCodes,
  getHierarchyRootCodes,
  cleanNode,
  mapHierarchyToMap,
  getMissingCodesWithSystems,
  getMissingCodes,
  buildMultipleTrees,
  buildTree,
  groupBySystem,
  getDisplayFromTree,
  getDisplayFromTrees,
  updateBranchStatus,
  getItemSelectedStatus,
  getSelectedCodesFromTree,
  getSelectedCodesFromTrees,
  createHierarchyRoot
} from 'utils/hierarchy' // Remplacez par le nom de votre fichier
import { SelectedStatus } from 'types/hierarchy'
import { Codes, CodesCache, GroupedBySystem, Hierarchy, Mode } from 'types/hierarchy'
import { vi } from 'vitest'

describe('Utility Functions', () => {
  describe('mapCodesToCache', () => {
    it('should map Codes to Cache correctly', () => {
      const codes: Codes<Hierarchy<any>> = new Map([
        [
          'system1',
          new Map([
            ['code1', { id: 'code1', label: 'Label1', system: 'system1' } as Hierarchy],
            ['code2', { id: 'code2', label: 'Label2', system: 'system1' } as Hierarchy]
          ])
        ]
      ])

      const result = mapCodesToCache(codes)
      expect(result).toEqual([
        {
          id: 'system1',
          options: {
            code1: { id: 'code1', label: 'Label1', system: 'system1' },
            code2: { id: 'code2', label: 'Label2', system: 'system1' }
          }
        }
      ])
    })
  })

  describe('mapCacheToCodes', () => {
    it('should map Cache to Codes correctly', () => {
      const cache: CodesCache<any>[] = [
        {
          id: 'system1',
          options: {
            code1: { id: 'code1', label: 'Label1', system: 'system1' },
            code2: { id: 'code2', label: 'Label2', system: 'system1' }
          }
        }
      ]
      const result = mapCacheToCodes(cache)
      expect(result).toEqual(
        new Map([
          [
            'system1',
            new Map([
              ['code1', { id: 'code1', label: 'Label1', system: 'system1' }],
              ['code2', { id: 'code2', label: 'Label2', system: 'system1' }]
            ])
          ]
        ])
      )
    })
  })

  describe('getHierarchyRootCodes', () => {
    it('should extract root codes from hierarchy', () => {
      const hierarchy: Hierarchy<any>[] = [
        {
          id: 'root1',
          label: 'Root1',
          system: 'system1',
          subItems: [
            { id: 'child1', label: 'Child1', system: 'system1' },
            { id: 'child2', label: 'Child2', system: 'system1' }
          ]
        }
      ]

      const result = getHierarchyRootCodes(hierarchy)
      expect(result).toEqual(
        new Map([
          ['child1', { id: 'child1', label: 'Child1', system: 'system1' }],
          ['child2', { id: 'child2', label: 'Child2', system: 'system1' }]
        ])
      )
    })
  })

  describe('cleanNode', () => {
    it('should remove subItems and status from node', () => {
      const node: Hierarchy<any> = {
        id: 'node1',
        label: 'Node1',
        system: 'system1',
        subItems: [],
        status: SelectedStatus.SELECTED
      }

      const result = cleanNode(node)
      expect(result).toEqual({ id: 'node1', label: 'Node1', system: 'system1' })
    })
  })

  describe('mapHierarchyToMap', () => {
    it('should map hierarchy array to Map', () => {
      const hierarchy: Hierarchy<any>[] = [
        { id: 'code1', label: 'Label1', system: 'system1' },
        { id: 'code2', label: 'Label2', system: 'system1' }
      ]

      const result = mapHierarchyToMap(hierarchy)
      expect(result).toEqual(
        new Map([
          ['code1', { id: 'code1', label: 'Label1', system: 'system1' }],
          ['code2', { id: 'code2', label: 'Label2', system: 'system1' }]
        ])
      )
    })
  })

  describe('getMissingCodesWithSystems', () => {
    it('should fetch missing codes across systems', async () => {
      const trees = new Map([
        ['system1', [{ id: 'root1', label: 'Root1', system: 'system1' }]],
        ['system2', [{ id: 'root1', label: 'Root1', system: 'system2', inferior_levels_ids: 'root3' }]]
      ])
      const groupBySystem = [
        {
          system: 'system2',
          codes: [{ id: 'root4', label: 'Root4', system: 'system2', above_levels_ids: 'root1,root3' }]
        }
      ]
      const codes: Codes<Hierarchy<any>> = new Map([
        ['system1', new Map([['root1', { id: 'root1', label: 'Root1', system: 'system1' }]])],
        [
          'system2',
          new Map([['root1', { id: 'root1', label: 'Root1', system: 'system2', inferior_levels_ids: 'root3' }]])
        ]
      ])
      const fetchHandler = vi
        .fn()
        .mockResolvedValue([
          { id: 'root3', label: 'Root3', system: 'system2', above_levels_ids: 'root1', inferior_levels_ids: 'root4' }
        ])
      const result = await getMissingCodesWithSystems(trees, groupBySystem, codes, fetchHandler)
      expect(fetchHandler).toHaveBeenCalledWith('root3', 'system2')
      expect(result.get('system1')).toEqual(new Map([['root1', { id: 'root1', label: 'Root1', system: 'system1' }]]))
      expect(result.get('system2')).toEqual(
        new Map([
          ['root1', { id: 'root1', label: 'Root1', system: 'system2', inferior_levels_ids: 'root3' }],
          [
            'root3',
            { id: 'root3', label: 'Root3', system: 'system2', above_levels_ids: 'root1', inferior_levels_ids: 'root4' }
          ],
          ['root4', { id: 'root4', label: 'Root4', system: 'system2', above_levels_ids: 'root1,root3' }]
        ])
      )
    })
  })

  describe('getMissingCodes', () => {
    it('should identify missing codes', async () => {
      const node = {
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        system: 'system1',
        inferior_levels_ids: 'subItem1'
      }
      const prevCodes = new Map()
      const fetchHandler = vi
        .fn()
        .mockResolvedValue([
          { id: 'subItem1', label: 'SubItem1 ', system: 'system1', above_levels_ids: HIERARCHY_ROOT }
        ])
      const result = await getMissingCodes([node], prevCodes, [node], 'system1', Mode.EXPAND, fetchHandler)
      expect(fetchHandler).toHaveBeenCalledWith('subItem1', 'system1')
      expect(result).toEqual(
        new Map([
          [
            HIERARCHY_ROOT,
            {
              id: HIERARCHY_ROOT,
              label: 'Toute la hiérarchie',
              system: 'system1',
              inferior_levels_ids: 'subItem1'
            }
          ],
          ['subItem1', { id: 'subItem1', label: 'SubItem1 ', system: 'system1', above_levels_ids: HIERARCHY_ROOT }]
        ])
      )
    })
  })

  describe('buildTree', () => {
    it('should build a tree from baseTree and endCodes', () => {
      const baseTree: Hierarchy<any>[] = []
      const endCodes: Hierarchy<any>[] = [
        { id: 'code1', label: 'Label1', system: 'system1', above_levels_ids: '', inferior_levels_ids: '' }
      ]
      const codes = new Map([['code1', { id: 'code1', label: 'Label1', system: 'system1' }]])
      const selected = new Map()
      const mode = Mode.INIT

      const result = buildTree(baseTree, 'system1', endCodes, codes, selected, mode)

      expect(result).toEqual([
        { id: 'code1', label: 'Label1', system: 'system1', subItems: undefined, status: undefined }
      ])
    })
  })

  describe('createHierarchyRoot', () => {
    it('should create a hierarchy root node', () => {
      const system = 'system1'
      const status = SelectedStatus.SELECTED

      const result = createHierarchyRoot(system, status)
      expect(result).toEqual({
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        above_levels_ids: '',
        inferior_levels_ids: '',
        system,
        status
      })
    })
  })

  describe('groupBySystem', () => {
    it('should group codes by system correctly', () => {
      const codes: Hierarchy<any, string>[] = [
        { id: 'code1', label: 'Label1', system: 'system1' },
        { id: 'code2', label: 'Label2', system: 'system2' },
        { id: 'code3', label: 'Label3', system: 'system1' }
      ]

      const result = groupBySystem(codes)
      expect(result).toEqual([
        { system: 'system1', codes: [codes[0], codes[2]] },
        { system: 'system2', codes: [codes[1]] }
      ])
    })
  })

  describe('getDisplayFromTree', () => {
    it('should generate a display extract from a tree', () => {
      const tree: Hierarchy<any>[] = [
        {
          id: 'code1',
          label: 'Label1',
          system: 'system1',
          inferior_levels_ids: 'code2,code3',
          subItems: [
            {
              id: 'code2',
              label: 'Label2',
              system: 'system1',
              above_levels_ids: 'code1',
              inferior_levels_ids: 'code4',
              subItems: [{ id: 'code4', label: 'Label4', system: 'system1', above_levels_ids: 'code1,code2' }]
            },
            { id: 'code3', label: 'Label3', system: 'system1', above_levels_ids: 'code1' }
          ]
        }
      ]

      const toDisplay: Hierarchy<any>[] = [
        { id: 'code1', label: 'Label1', system: 'system1', inferior_levels_ids: 'code2,code3' },
        { id: 'code4', label: 'Label4', system: 'system1', above_levels_ids: 'code1,code2' }
      ]
      const result = getDisplayFromTree(toDisplay, tree)
      expect(result).toStrictEqual([
        {
          id: 'code1',
          label: 'Label1',
          system: 'system1',
          inferior_levels_ids: 'code2,code3',
          subItems: [
            {
              id: 'code2',
              label: 'Label2',
              system: 'system1',
              above_levels_ids: 'code1',
              inferior_levels_ids: 'code4',
              subItems: [{ id: 'code4', label: 'Label4', system: 'system1', above_levels_ids: 'code1,code2' }]
            },
            { id: 'code3', label: 'Label3', system: 'system1', above_levels_ids: 'code1' }
          ]
        },
        { id: 'code4', label: 'Label4', system: 'system1', above_levels_ids: 'code1,code2' }
      ])
    })
  })

  describe('getDisplayFromTrees', () => {
    it('should generate different display extracts from multiple trees', () => {
      const toDisplay: Hierarchy<any, string>[] = [
        { id: 'code2', label: 'Label2', system: 'system1', above_levels_ids: 'code1' },
        { id: 'code2', label: 'Label2', system: 'system2' }
      ]
      const trees = new Map([
        [
          'system1',
          [
            {
              id: 'code1',
              label: 'Label1',
              system: 'system1',
              inferior_levels_ids: 'code2',
              subItems: [{ id: 'code2', label: 'Label2', system: 'system1', above_levels_ids: 'code1' }]
            }
          ]
        ],
        ['system2', [{ id: 'code2', label: 'Label2', system: 'system2' }]]
      ])
      const result = getDisplayFromTrees(toDisplay, trees)
      expect(result).toStrictEqual([
        {
          id: 'code2',
          label: 'Label2',
          system: 'system1',
          above_levels_ids: 'code1'
        },
        { id: 'code2', label: 'Label2', system: 'system2' }
      ])
    })
  })

  describe('updateBranchStatus', () => {
    it('should update the status of a branch subitems according to the first node status', () => {
      const branch: Hierarchy<any> = {
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        system: 'system1',
        status: SelectedStatus.SELECTED,
        subItems: [{ id: 'child1', label: 'Child1', system: 'system1', status: SelectedStatus.NOT_SELECTED }]
      }

      const node = updateBranchStatus(branch, branch.status)
      expect(node.status).toBe(SelectedStatus.SELECTED)
      expect(node.subItems![0].status).toBe(SelectedStatus.SELECTED)
    })
  })

  describe('getItemSelectedStatus', () => {
    it('should return the correct status of an item according to its subitems', () => {
      const notSelected: Hierarchy<any> = {
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        system: 'system1',
        status: SelectedStatus.SELECTED,
        subItems: [{ id: '2', status: SelectedStatus.NOT_SELECTED }, { id: '3' }]
      }
      const selected: Hierarchy<any> = {
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        system: 'system1',
        status: SelectedStatus.SELECTED,
        subItems: [
          { id: '2', status: SelectedStatus.SELECTED },
          { id: '3', status: SelectedStatus.SELECTED }
        ]
      }
      const indeterminate: Hierarchy<any> = {
        id: HIERARCHY_ROOT,
        label: 'Toute la hiérarchie',
        system: 'system1',
        status: SelectedStatus.SELECTED,
        subItems: [{ id: '2', status: SelectedStatus.SELECTED }, { id: '3' }]
      }

      const result1 = getItemSelectedStatus(notSelected)
      expect(result1).toBe(SelectedStatus.NOT_SELECTED)
      const result2 = getItemSelectedStatus(selected)
      expect(result2).toBe(SelectedStatus.SELECTED)
      const result3 = getItemSelectedStatus(indeterminate)
      expect(result3).toBe(SelectedStatus.INDETERMINATE)
    })
  })

  describe('getSelectedCodesFromTree', () => {
    it('should return selected codes from a tree', () => {
      const tree: Hierarchy<any>[] = [
        { id: 'code1', label: 'Label1', system: 'system1', status: SelectedStatus.SELECTED },
        { id: 'code2', label: 'Label2', system: 'system1', status: SelectedStatus.NOT_SELECTED }
      ]

      const result = getSelectedCodesFromTree(tree)
      expect(result).toEqual(new Map([['code1', tree[0]]]))
    })
  })

  describe('getSelectedCodesFromTrees', () => {
    it('should return selected codes from multiple trees', () => {
      const trees = new Map([
        [
          'system1',
          [{ id: HIERARCHY_ROOT, label: 'Toute la hiérarchie', system: 'system1', status: SelectedStatus.SELECTED }]
        ],
        [
          'system2',
          [
            {
              id: HIERARCHY_ROOT,
              label: 'Toute la hiérarchie',
              system: 'system2',
              inferior_levels_ids: 'code1,code2',
              status: SelectedStatus.INDETERMINATE,
              subItems: [
                {
                  id: 'code1',
                  above_levels_ids: `${HIERARCHY_ROOT}`,
                  status: SelectedStatus.SELECTED,
                  system: 'system2'
                },
                {
                  id: 'code2',
                  above_levels_ids: `${HIERARCHY_ROOT}`,
                  status: SelectedStatus.NOT_SELECTED,
                  system: 'system2'
                }
              ]
            }
          ]
        ]
      ])
      const prevCodes: Codes<any> = new Map()
      const result = getSelectedCodesFromTrees(trees, prevCodes)
      expect(result.get('system1')).toEqual(
        new Map([
          [
            HIERARCHY_ROOT,
            { id: HIERARCHY_ROOT, label: 'Toute la hiérarchie', system: 'system1', status: SelectedStatus.SELECTED }
          ]
        ])
      )
      expect(result.get('system2')).toEqual(
        new Map([
          [
            'code1',
            {
              id: 'code1',
              above_levels_ids: `${HIERARCHY_ROOT}`,
              status: SelectedStatus.SELECTED,
              system: 'system2'
            }
          ]
        ])
      )
    })
  })

  describe('buildMultipleTrees', () => {
    it('should build multiple trees according to different systems', () => {
      const groupBySystem: GroupedBySystem<any>[] = [
        {
          system: 'system1',
          codes: [
            {
              id: HIERARCHY_ROOT,
              label: 'Toute la hiérarchie',
              system: 'system1'
            }
          ]
        },
        {
          system: 'system2',
          codes: [
            {
              id: 'code1',
              above_levels_ids: HIERARCHY_ROOT,
              system: 'system2'
            },
            {
              id: 'code2',
              above_levels_ids: HIERARCHY_ROOT,
              system: 'system2'
            }
          ]
        }
      ]
      const baseTrees = new Map([
        [
          'system1',
          [
            {
              id: HIERARCHY_ROOT,
              label: 'Toute la hiérarchie',
              system: 'system1'
            }
          ]
        ],
        [
          'system2',
          [
            {
              id: HIERARCHY_ROOT,
              label: 'Toute la hiérarchie',
              system: 'system2',
              inferior_levels_ids: 'code1,code2'
            }
          ]
        ]
      ])
      const codes = new Map<string, Map<string, Hierarchy<any>>>([
        [
          'system1',
          new Map([
            [
              HIERARCHY_ROOT,
              {
                id: HIERARCHY_ROOT,
                label: 'Toute la hiérarchie',
                system: 'system1'
              }
            ]
          ])
        ],
        [
          'system2',
          new Map([
            [
              HIERARCHY_ROOT,
              {
                id: HIERARCHY_ROOT,
                label: 'Toute la hiérarchie',
                inferior_levels_ids: 'code1,code2',
                system: 'system2'
              }
            ],
            [
              'code1',
              {
                id: 'code1',
                above_levels_ids: HIERARCHY_ROOT,
                system: 'system2'
              }
            ],
            [
              'code2',
              {
                id: 'code2',
                above_levels_ids: HIERARCHY_ROOT,
                system: 'system2'
              }
            ]
          ])
        ]
      ])
      const mode = Mode.INIT
      const result = buildMultipleTrees(baseTrees, groupBySystem, codes, new Map(), mode)
      expect(result.get('system1')).toEqual([
        {
          id: HIERARCHY_ROOT,
          label: 'Toute la hiérarchie',
          system: 'system1'
        }
      ])
      expect(result.get('system2')).toEqual([
        {
          id: HIERARCHY_ROOT,
          label: 'Toute la hiérarchie',
          system: 'system2',
          inferior_levels_ids: 'code1,code2',
          status: SelectedStatus.NOT_SELECTED,
          subItems: [
            {
              id: 'code1',
              above_levels_ids: HIERARCHY_ROOT,
              system: 'system2'
            },
            {
              id: 'code2',
              above_levels_ids: HIERARCHY_ROOT,
              system: 'system2'
            }
          ]
        }
      ])
    })
  })
})
