import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCodeSystemFromValueSet,
  getChildrenFromCodes,
  searchInValueSets,
  getCodeList,
  getHierarchyRoots
} from 'services/aphp/serviceValueSets'
import apiFhir from 'services/apiFhir'

// Mock dependencies
vi.mock('services/apiFhir', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    system: {
      datamodelUrl: 'https://localhost'
    },
    core: {
      maxParallelCodeSearchExpandCount: 50,
      extensions: {
        codeHierarchy: 'https://test.com/hierarchy',
        statTotal: 'https://test.com/statTotal',
        statTotalUnique: 'https://test.com/statTotalUnique'
      }
    },
    features: {
      observation: {
        valueSets: {
          biologyHierarchyAnabio: {
            url: 'https://terminology.hl7.org/ValueSet/biology-anabio'
          }
        }
      },
      medication: {
        valueSets: {
          medicationAtc: {
            url: 'https://terminology.hl7.org/ValueSet/medication-atc'
          }
        }
      }
    }
  })),
  onUpdateConfig: vi.fn()
}))

vi.mock('data/valueSets', () => ({
  getReferences: vi.fn(() => [
    {
      url: 'https://terminology.hl7.org/ValueSet/test-valueset',
      label: 'Test ValueSet',
      title: 'Test ValueSet Title',
      standard: true,
      checked: false,
      joinDisplayWithCode: true,
      joinDisplayWithSystem: true,
      codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/test-codesystem']
    },
    {
      url: 'https://terminology.hl7.org/ValueSet/biology-anabio',
      label: 'Biology Anabio',
      title: 'Biology Anabio Title',
      standard: true,
      checked: false,
      joinDisplayWithCode: true,
      joinDisplayWithSystem: false,
      codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/biology-anabio']
    }
  ])
}))

vi.mock('utils/valueSets', () => ({
  getValueSetFromCodeSystem: vi.fn((codeSystemUrl: string) => {
    if (codeSystemUrl === 'https://terminology.hl7.org/CodeSystem/test-codesystem') {
      return 'https://terminology.hl7.org/ValueSet/test-valueset'
    }
    if (codeSystemUrl === 'https://terminology.hl7.org/CodeSystem/biology-anabio') {
      return 'https://terminology.hl7.org/ValueSet/biology-anabio'
    }
    return undefined
  })
}))

describe('serviceValueSets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getChildrenFromCodes', () => {
    it('should fetch children codes for a single code', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'valueSet',
              resource: {
                resourceType: 'ValueSet',
                expansion: {
                  contains: [
                    {
                      code: 'child1',
                      display: 'Child 1',
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.post).mockResolvedValue(mockResponse)

      const result = await getChildrenFromCodes('https://terminology.hl7.org/ValueSet/test-valueset', ['code1'])

      expect(result.results).toHaveLength(1)
      expect(result.results[0].id).toBe('child1')
      expect(result.results[0].label).toBe('Child 1')
      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })

    it('should batch requests when code count exceeds maxParallelCodeSearchExpandCount', async () => {
      const codes = Array.from({ length: 100 }, (_, i) => `code${i}`)
      const mockResponse = {
        data: {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'valueSet',
              resource: {
                resourceType: 'ValueSet',
                expansion: {
                  contains: []
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.post).mockResolvedValue(mockResponse)

      await getChildrenFromCodes('https://terminology.hl7.org/ValueSet/test-valueset', codes)

      // Should be called twice (100 codes / 50 max = 2 batches)
      expect(apiFhir.post).toHaveBeenCalledTimes(2)
    })

    it('should handle codes with statistics extensions', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'valueSet',
              resource: {
                resourceType: 'ValueSet',
                expansion: {
                  contains: [
                    {
                      code: 'child1',
                      display: 'Child 1',
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      extension: [
                        {
                          url: 'https://test.com/statTotal',
                          valueInteger: 100
                        },
                        {
                          url: 'https://test.com/statTotalUnique',
                          valueInteger: 50
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.post).mockResolvedValue(mockResponse)

      const result = await getChildrenFromCodes('https://terminology.hl7.org/ValueSet/test-valueset', ['code1'])

      expect(result.results[0].statTotal).toBe(100)
      expect(result.results[0].statTotalUnique).toBe(50)
    })

    it('should map CodeSystem URL to ValueSet URL correctly', async () => {
      const mockResponse = {
        data: {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'valueSet',
              resource: {
                resourceType: 'ValueSet',
                expansion: {
                  contains: [
                    {
                      code: 'child1',
                      display: 'Child 1',
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.post).mockResolvedValue(mockResponse)

      const result = await getChildrenFromCodes('https://terminology.hl7.org/ValueSet/test-valueset', ['code1'])

      expect(result.results[0].system).toBe('https://terminology.hl7.org/CodeSystem/test-codesystem')
      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })
  })

  describe('searchInValueSets', () => {
    it('should search in multiple value sets', async () => {
      const mockResponse = {
        data: {
          resourceType: 'ValueSet',
          expansion: {
            contains: [
              {
                code: 'result1',
                display: 'Result 1',
                system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
              }
            ]
          }
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await searchInValueSets(
        ['https://terminology.hl7.org/ValueSet/test-valueset'],
        'test search'
      )

      expect(result.results).toHaveLength(1)
      expect(result.results[0].id).toBe('result1')
      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('activeOnly=true'),
        expect.any(Object)
      )
    })

    it('should handle search with pagination', async () => {
      const mockResponse = {
        data: {
          resourceType: 'ValueSet',
          expansion: {
            contains: [
              {
                code: 'result1',
                display: 'Result 1',
                system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
              }
            ]
          }
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      await searchInValueSets(
        ['https://terminology.hl7.org/ValueSet/test-valueset'],
        'test',
        10,
        20
      )

      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('offset=10'),
        expect.any(Object)
      )
      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('count=20'),
        expect.any(Object)
      )
    })

    it('should use correct ValueSet URL when searching single ValueSet', async () => {
      const mockResponse = {
        data: {
          resourceType: 'ValueSet',
          expansion: {
            contains: [
              {
                code: 'result1',
                display: 'Result 1',
                system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
              }
            ]
          }
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await searchInValueSets(
        ['https://terminology.hl7.org/ValueSet/test-valueset'],
        'test'
      )

      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })

    it('should not pass specific valueSetUrl when searching multiple ValueSets', async () => {
      const mockResponse = {
        data: {
          resourceType: 'ValueSet',
          expansion: {
            contains: [
              {
                code: 'result1',
                display: 'Result 1',
                system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
              }
            ]
          }
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await searchInValueSets(
        [
          'https://terminology.hl7.org/ValueSet/test-valueset',
          'https://terminology.hl7.org/ValueSet/biology-anabio'
        ],
        'test'
      )

      // Should use getValueSetFromCodeSystem to determine correct ValueSet
      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })
  })

  describe('getCodeList', () => {
    it('should fetch complete code list for a ValueSet', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                url: 'https://terminology.hl7.org/ValueSet/test-valueset',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: [
                        {
                          code: 'code1',
                          display: 'Code 1'
                        },
                        {
                          code: 'code2',
                          display: 'Code 2'
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await getCodeList('https://terminology.hl7.org/ValueSet/test-valueset', false)

      expect(result.results).toHaveLength(2)
      expect(result.results[0].id).toBe('code1')
      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
      expect(result.count).toBe(2)
    })

    it('should include code in label when codeInLabel is true', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                url: 'https://terminology.hl7.org/ValueSet/test-valueset',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: [
                        {
                          code: 'code1',
                          display: 'code 1'
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await getCodeList('https://terminology.hl7.org/ValueSet/test-valueset', true)

      expect(result.results[0].label).toBe('code1 - Code 1')
    })

    it('should use url parameter instead of reference', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                url: 'https://terminology.hl7.org/ValueSet/test-valueset',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: []
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      await getCodeList('https://terminology.hl7.org/ValueSet/test-valueset')

      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('url=https://terminology.hl7.org/ValueSet/test-valueset'),
        expect.any(Object)
      )
    })
    it('should fetch complete code list for a CodeSystem URL', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'CodeSystem',
                url: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                concept: [
                  {
                    code: 'code1',
                    display: 'Code 1'
                  },
                  {
                    code: 'code2',
                    display: 'Code 2'
                  }
                ]
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await getCodeList('https://terminology.hl7.org/CodeSystem/test-codesystem', false)

      expect(result.results).toHaveLength(2)
      expect(result.results[0].system).toBe('https://terminology.hl7.org/CodeSystem/test-codesystem')
      expect(result.count).toBe(2)
      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('/CodeSystem?url=https://terminology.hl7.org/CodeSystem/test-codesystem'),
        expect.any(Object)
      )
    })
  })

  describe('getHierarchyRoots', () => {
    it('should fetch hierarchy roots with valueSetUrl', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: [
                        {
                          code: 'root1',
                          display: 'Root 1'
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await getHierarchyRoots(
        'https://terminology.hl7.org/ValueSet/test-valueset',
        'Test ValueSet'
      )

      expect(result.results).toHaveLength(1)
      expect(result.results[0].id).toBe('*')
      expect(result.results[0].label).toBe('Test ValueSet')
      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })

    it('should use url parameter instead of reference', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: []
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      await getHierarchyRoots('https://terminology.hl7.org/ValueSet/test-valueset', 'Test')

      expect(apiFhir.get).toHaveBeenCalledWith(
        expect.stringContaining('url=https://terminology.hl7.org/ValueSet/test-valueset'),
        expect.any(Object)
      )
    })

    it('should populate valueSetUrl in all hierarchy nodes', async () => {
      const mockResponse = {
        data: {
          entry: [
            {
              resource: {
                resourceType: 'ValueSet',
                compose: {
                  include: [
                    {
                      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
                      concept: [
                        {
                          code: 'root1',
                          display: 'Root 1'
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }

      vi.mocked(apiFhir.get).mockResolvedValue(mockResponse)

      const result = await getHierarchyRoots(
        'https://terminology.hl7.org/ValueSet/test-valueset',
        'Test ValueSet'
      )

      expect(result.results[0].valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
      if (result.results[0].subItems) {
        result.results[0].subItems.forEach((subItem) => {
          expect(subItem.valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
        })
      }
    })
  })

  describe('getCodeSystemFromValueSet', () => {
    it('should return CodeSystem URLs for a given ValueSet URL', () => {
      const result = getCodeSystemFromValueSet('https://terminology.hl7.org/ValueSet/test-valueset')

      expect(result).toEqual(['https://terminology.hl7.org/CodeSystem/test-codesystem'])
    })

    it('should return undefined for non-existent ValueSet URL', () => {
      const result = getCodeSystemFromValueSet('https://non-existent')

      expect(result).toBeUndefined()
    })
  })
})
