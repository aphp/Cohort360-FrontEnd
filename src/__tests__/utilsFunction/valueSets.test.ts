import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getValueSetsByUrls,
  getValueSetFromCodeSystem,
  getValueSetReferenceFromCodeSystem,
  isDisplayedWithCode,
  isDisplayedWithSystem,
  getLabelFromCode,
  getFullLabelFromCode,
  getLabelFromSystem,
  checkIsLeaf
} from 'utils/valueSets'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

// Mock dependencies
vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    features: {
      observation: {
        valueSets: {
          biologyHierarchyAnabio: {
            url: 'https://terminology.hl7.org/ValueSet/biology-anabio',
            codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/biology-anabio']
          }
        }
      }
    }
  }))
}))

vi.mock('data/valueSets', () => ({
  getReferences: vi.fn(() => [
    {
      url: 'https://terminology.hl7.org/ValueSet/test-valueset',
      label: 'Test ValueSet',
      title: 'Test ValueSet Title',
      standard: true,
      checked: false,
      isHierarchy: true,
      joinDisplayWithCode: true,
      joinDisplayWithSystem: true,
      codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/test-codesystem']
    },
    {
      url: 'https://terminology.hl7.org/ValueSet/another-valueset',
      label: 'Another ValueSet',
      title: 'Another ValueSet Title',
      standard: false,
      checked: false,
      isHierarchy: false,
      joinDisplayWithCode: false,
      joinDisplayWithSystem: false,
      codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/another-codesystem']
    },
    {
      url: 'https://terminology.hl7.org/ValueSet/biology-anabio',
      label: 'Biology Anabio',
      title: 'Biology Anabio Title',
      standard: true,
      checked: false,
      isHierarchy: true,
      joinDisplayWithCode: true,
      joinDisplayWithSystem: false,
      codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/biology-anabio']
    }
  ])
}))

vi.mock('services/aphp/serviceValueSets', () => ({
  HIERARCHY_ROOT: '*',
  getChildrenFromCodes: vi.fn()
}))

describe('valueSets utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getValueSetsByUrls', () => {
    it('should return value sets matching the provided URLs', () => {
      const urls = ['https://terminology.hl7.org/ValueSet/test-valueset']
      const result = getValueSetsByUrls(urls)
      
      expect(result).toHaveLength(1)
      expect(result[0].url).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
      expect(result[0].label).toBe('Test ValueSet')
    })

    it('should return multiple value sets when multiple URLs match', () => {
      const urls = [
        'https://terminology.hl7.org/ValueSet/test-valueset',
        'https://terminology.hl7.org/ValueSet/another-valueset'
      ]
      const result = getValueSetsByUrls(urls)
      
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no URLs match', () => {
      const urls = ['https://terminology.hl7.org/ValueSet/non-existent']
      const result = getValueSetsByUrls(urls)
      
      expect(result).toHaveLength(0)
    })

    it('should handle empty URL array', () => {
      const result = getValueSetsByUrls([])
      
      expect(result).toHaveLength(0)
    })
  })

  describe('getValueSetFromCodeSystem', () => {
    it('should return ValueSet URL for a given CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      const result = getValueSetFromCodeSystem(codeSystemUrl)
      
      expect(result).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
    })

    it('should return undefined for non-existent CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/non-existent'
      const result = getValueSetFromCodeSystem(codeSystemUrl)
      
      expect(result).toBeUndefined()
    })

    it('should handle multiple CodeSystem URLs in a ValueSet', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/biology-anabio'
      const result = getValueSetFromCodeSystem(codeSystemUrl)
      
      expect(result).toBe('https://terminology.hl7.org/ValueSet/biology-anabio')
    })
  })

  describe('getValueSetReferenceFromCodeSystem', () => {
    it('should return full reference object for a given CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      const result = getValueSetReferenceFromCodeSystem(codeSystemUrl)
      
      expect(result).toBeDefined()
      expect(result?.url).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
      expect(result?.label).toBe('Test ValueSet')
    })

    it('should return undefined for non-existent CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/non-existent'
      const result = getValueSetReferenceFromCodeSystem(codeSystemUrl)
      
      expect(result).toBeUndefined()
    })
  })

  describe('isDisplayedWithCode', () => {
    it('should return true when joinDisplayWithCode is true for CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      const result = isDisplayedWithCode(codeSystemUrl)
      
      expect(result).toBe(true)
    })

    it('should return false when joinDisplayWithCode is false for CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/another-codesystem'
      const result = isDisplayedWithCode(codeSystemUrl)
      
      expect(result).toBe(false)
    })

    it('should return true when joinDisplayWithCode is true for ValueSet URL', () => {
      const valueSetUrl = 'https://terminology.hl7.org/ValueSet/test-valueset'
      const result = isDisplayedWithCode(valueSetUrl)
      
      expect(result).toBe(true)
    })

    it('should return false when joinDisplayWithCode is false for ValueSet URL', () => {
      const valueSetUrl = 'https://terminology.hl7.org/ValueSet/another-valueset'
      const result = isDisplayedWithCode(valueSetUrl)
      
      expect(result).toBe(false)
    })

    it('should return undefined for non-existent URL', () => {
      const result = isDisplayedWithCode('https://non-existent')
      
      expect(result).toBeUndefined()
    })
  })

  describe('isDisplayedWithSystem', () => {
    it('should return true when joinDisplayWithSystem is true for CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      const result = isDisplayedWithSystem(codeSystemUrl)
      
      expect(result).toBe(true)
    })

    it('should return false when joinDisplayWithSystem is false for CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/another-codesystem'
      const result = isDisplayedWithSystem(codeSystemUrl)
      
      expect(result).toBe(false)
    })

    it('should return true when joinDisplayWithSystem is true for ValueSet URL', () => {
      const valueSetUrl = 'https://terminology.hl7.org/ValueSet/test-valueset'
      const result = isDisplayedWithSystem(valueSetUrl)
      
      expect(result).toBe(true)
    })

    it('should return false when joinDisplayWithSystem is false for ValueSet URL', () => {
      const valueSetUrl = 'https://terminology.hl7.org/ValueSet/another-valueset'
      const result = isDisplayedWithSystem(valueSetUrl)
      
      expect(result).toBe(false)
    })
  })

  describe('getLabelFromCode', () => {
    it('should return label with code when isDisplayedWithCode is true', () => {
      const code: Hierarchy<any> = {
        id: 'CODE123',
        label: 'Test Label',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
      const result = getLabelFromCode(code)
      
      expect(result).toBe('CODE123 - Test Label')
    })

    it('should return label without code when isDisplayedWithCode is false', () => {
      const code: Hierarchy<any> = {
        id: 'CODE456',
        label: 'Another Label',
        system: 'https://terminology.hl7.org/CodeSystem/another-codesystem',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
      const result = getLabelFromCode(code)
      
      expect(result).toBe('Another Label')
    })

    it('should return label without code for HIERARCHY_ROOT', () => {
      const code: Hierarchy<any> = {
        id: HIERARCHY_ROOT,
        label: 'Root Label',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
      const result = getLabelFromCode(code)
      
      expect(result).toBe('Root Label')
    })

    it('should use valueSetUrl when available', () => {
      const code: Hierarchy<any> = {
        id: 'CODE789',
        label: 'ValueSet Label',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
        valueSetUrl: 'https://terminology.hl7.org/ValueSet/test-valueset',
        above_levels_ids: '',
        inferior_levels_ids: ''
      }
      const result = getLabelFromCode(code)
      
      expect(result).toBe('CODE789 - ValueSet Label')
    })
  })

  describe('getFullLabelFromCode', () => {
    it('should return full label with system and code when both are enabled', () => {
      const code = {
        id: 'CODE123',
        label: 'Test Label',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      }
      const result = getFullLabelFromCode(code)
      
      expect(result).toBe('Test ValueSet - CODE123 - Test Label')
    })

    it('should return label without system when joinDisplayWithSystem is false', () => {
      const code = {
        id: 'CODE456',
        label: 'Another Label',
        system: 'https://terminology.hl7.org/CodeSystem/another-codesystem'
      }
      const result = getFullLabelFromCode(code)
      
      expect(result).toBe('Another Label')
    })

    it('should return label without code for HIERARCHY_ROOT', () => {
      const code = {
        id: HIERARCHY_ROOT,
        label: 'Root Label',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      }
      const result = getFullLabelFromCode(code)
      
      expect(result).toBe('Test ValueSet - Root Label')
    })

    it('should return just label when system is undefined', () => {
      const code = {
        id: 'CODE789',
        label: 'No System Label',
        system: undefined
      }
      const result = getFullLabelFromCode(code)
      
      expect(result).toBe('No System Label')
    })
  })

  describe('getLabelFromSystem', () => {
    it('should return label for CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/test-codesystem'
      const result = getLabelFromSystem(codeSystemUrl)
      
      expect(result).toBe('Test ValueSet')
    })

    it('should return label for ValueSet URL', () => {
      const valueSetUrl = 'https://terminology.hl7.org/ValueSet/test-valueset'
      const result = getLabelFromSystem(valueSetUrl)
      
      expect(result).toBe('Test ValueSet')
    })

    it('should return empty string for non-existent URL', () => {
      const result = getLabelFromSystem('https://non-existent')
      
      expect(result).toBe('')
    })
  })

  describe('checkIsLeaf', () => {
    it('should return false when codes array has more than one element', async () => {
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'system1',
          above_levels_ids: '',
          inferior_levels_ids: ''
        },
        {
          id: 'code2',
          label: 'Label 2',
          system: 'system1',
          above_levels_ids: '',
          inferior_levels_ids: ''
        }
      ]
      const cache = new Map()
      
      const result = await checkIsLeaf(codes, cache)
      
      expect(result).toBe(false)
    })

    it('should return false when code is HIERARCHY_ROOT', async () => {
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: HIERARCHY_ROOT,
          label: 'Root',
          system: 'system1',
          above_levels_ids: '',
          inferior_levels_ids: ''
        }
      ]
      const cache = new Map()
      
      const result = await checkIsLeaf(codes, cache)
      
      expect(result).toBe(false)
    })

    it('should return true when code has no children', async () => {
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'system1',
          above_levels_ids: '',
          inferior_levels_ids: ''
        }
      ]
      const cache = new Map()
      
      const result = await checkIsLeaf(codes, cache)
      
      expect(result).toBe(true)
    })

    it('should return false when code has multiple children', async () => {
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'system1',
          above_levels_ids: '',
          inferior_levels_ids: 'child1,child2'
        }
      ]
      const cache = new Map()
      
      const result = await checkIsLeaf(codes, cache)
      
      expect(result).toBe(false)
    })

    it('should use cache when child code is available', async () => {
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'system1',
          valueSetUrl: 'https://terminology.hl7.org/ValueSet/test-valueset',
          above_levels_ids: '',
          inferior_levels_ids: 'child1'
        }
      ]
      const childCode: Hierarchy<FhirItem> = {
        id: 'child1',
        label: 'Child 1',
        system: 'system1',
        above_levels_ids: 'code1',
        inferior_levels_ids: ''
      }
      const cache = new Map([
        ['https://terminology.hl7.org/ValueSet/test-valueset', new Map([['child1', childCode]])]
      ])
      
      const result = await checkIsLeaf(codes, cache)
      
      expect(result).toBe(true)
    })

    it('should fetch child code when not in cache', async () => {
      const { getChildrenFromCodes } = await import('services/aphp/serviceValueSets')
      const mockGetChildrenFromCodes = getChildrenFromCodes as any
      
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
          valueSetUrl: 'https://terminology.hl7.org/ValueSet/test-valueset',
          above_levels_ids: '',
          inferior_levels_ids: 'child1'
        }
      ]
      const childCode: Hierarchy<FhirItem> = {
        id: 'child1',
        label: 'Child 1',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
        above_levels_ids: 'code1',
        inferior_levels_ids: ''
      }
      
      mockGetChildrenFromCodes.mockResolvedValue({ results: [childCode] })
      
      const cache = new Map()
      const result = await checkIsLeaf(codes, cache)
      
      expect(mockGetChildrenFromCodes).toHaveBeenCalledWith(
        'https://terminology.hl7.org/ValueSet/test-valueset',
        ['child1']
      )
      expect(result).toBe(true)
    })

    it('should use getValueSetFromCodeSystem when valueSetUrl is not available', async () => {
      const { getChildrenFromCodes } = await import('services/aphp/serviceValueSets')
      const mockGetChildrenFromCodes = getChildrenFromCodes as any
      
      const codes: Hierarchy<FhirItem>[] = [
        {
          id: 'code1',
          label: 'Label 1',
          system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
          above_levels_ids: '',
          inferior_levels_ids: 'child1'
        }
      ]
      const childCode: Hierarchy<FhirItem> = {
        id: 'child1',
        label: 'Child 1',
        system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
        above_levels_ids: 'code1',
        inferior_levels_ids: ''
      }
      
      mockGetChildrenFromCodes.mockResolvedValue({ results: [childCode] })
      
      const cache = new Map()
      const result = await checkIsLeaf(codes, cache)
      
      expect(mockGetChildrenFromCodes).toHaveBeenCalledWith(
        'https://terminology.hl7.org/ValueSet/test-valueset',
        ['child1']
      )
      expect(result).toBe(true)
    })
  })
})