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
  getResourceTypeFromUrl,
  getCodeSystemUrlFromValueSetUrl,
  getSearchSystemUrl,
  checkIsLeaf,
  matchStoredCodeInCache,
  findCodeByIdOrPrefix,
  expandStoredCodeInCache,
  expandStoredCodesInCache
} from 'utils/valueSets'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

// Mock dependencies
vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    core: {
      valueSets: {
        demographicGender: {
          url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-orbis-patient-genre',
          codeSystemUrls: ['https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-orbis-patient-genre'],
          resourceType: 'CodeSystem'
        }
      }
    },
    features: {
      observation: {
        valueSets: {
          biologyHierarchyAnabio: {
            url: 'https://terminology.hl7.org/ValueSet/biology-anabio',
            codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/biology-anabio'],
            resourceType: 'ValueSet'
          }
        }
      },
      condition: {
        valueSets: {
          conditionStatus: {
            url: 'https://terminology.hl7.org/ValueSet/malformed-codesystem',
            resourceType: 'CodeSystem'
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
      const cache = new Map([['https://terminology.hl7.org/ValueSet/test-valueset', new Map([['child1', childCode]])]])

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

      expect(mockGetChildrenFromCodes).toHaveBeenCalledWith('https://terminology.hl7.org/ValueSet/test-valueset', [
        'child1'
      ])
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

      expect(mockGetChildrenFromCodes).toHaveBeenCalledWith('https://terminology.hl7.org/ValueSet/test-valueset', [
        'child1'
      ])
      expect(result).toBe(true)
    })
  })

  describe('getResourceTypeFromUrl', () => {
    it('resolves resourceType for a core.valueSets entry not exposed by getReferences', () => {
      expect(getResourceTypeFromUrl('https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-orbis-patient-genre')).toBe(
        'CodeSystem'
      )
    })

    it('resolves resourceType for a feature valueSet entry', () => {
      expect(getResourceTypeFromUrl('https://terminology.hl7.org/ValueSet/biology-anabio')).toBe('ValueSet')
    })

    it('returns undefined for an unknown url', () => {
      expect(getResourceTypeFromUrl('https://terminology.hl7.org/ValueSet/does-not-exist')).toBeUndefined()
    })
  })

  describe('getCodeSystemUrlFromValueSetUrl', () => {
    it('returns the configured CodeSystem URL for a ValueSet URL', () => {
      expect(
        getCodeSystemUrlFromValueSetUrl('https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-orbis-patient-genre')
      ).toBe('https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-orbis-patient-genre')
    })

    it('falls back to the input url when no CodeSystem mapping is configured', () => {
      const unknownUrl = 'https://terminology.hl7.org/ValueSet/does-not-exist'
      expect(getCodeSystemUrlFromValueSetUrl(unknownUrl)).toBe(unknownUrl)
    })

    it('falls back to the ValueSet url and logs an error for a CodeSystem entry missing codeSystemUrls', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const malformedUrl = 'https://terminology.hl7.org/ValueSet/malformed-codesystem'
      expect(getCodeSystemUrlFromValueSetUrl(malformedUrl)).toBe(malformedUrl)
      expect(errorSpy).toHaveBeenCalledOnce()
      errorSpy.mockRestore()
    })
  })

  describe('getSearchSystemUrl', () => {
    it('returns the first CodeSystem URL when resourceType is CodeSystem', () => {
      const config = {
        url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/aphp-medicament-type-prescription',
        codeSystemUrls: ['https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-medicament-type-prescription'],
        resourceType: 'CodeSystem' as const
      }
      expect(getSearchSystemUrl(config)).toBe(
        'https://terminology.eds.aphp.fr/fhir/CodeSystem/aphp-medicament-type-prescription'
      )
    })

    it('returns the ValueSet url when resourceType is ValueSet', () => {
      const config = {
        url: 'https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-aph-mat-type-anesth-vs',
        codeSystemUrls: ['https://aphp.fr/ig/fhir/eds/CodeSystem/aphp-eds-aph-mat-type-anesth-cs'],
        resourceType: 'ValueSet' as const
      }
      expect(getSearchSystemUrl(config)).toBe('https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-aph-mat-type-anesth-vs')
    })

    it('returns the url when resourceType is not set', () => {
      const config = {
        url: 'https://terminology.hl7.org/ValueSet/no-resource-type',
        codeSystemUrls: ['https://terminology.hl7.org/CodeSystem/no-resource-type']
      }
      expect(getSearchSystemUrl(config)).toBe('https://terminology.hl7.org/ValueSet/no-resource-type')
    })

    it('falls back to url and logs an error when resourceType is CodeSystem but codeSystemUrls is missing', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const config = {
        url: 'https://terminology.hl7.org/CodeSystem/inline-codesystem',
        resourceType: 'CodeSystem' as const
      }
      expect(getSearchSystemUrl(config)).toBe('https://terminology.hl7.org/CodeSystem/inline-codesystem')
      expect(errorSpy).toHaveBeenCalledOnce()
      errorSpy.mockRestore()
    })

    it('falls back to url and logs an error when resourceType is CodeSystem but codeSystemUrls is empty', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const config = {
        url: 'https://terminology.hl7.org/CodeSystem/empty-codesystem',
        codeSystemUrls: [],
        resourceType: 'CodeSystem' as const
      }
      expect(getSearchSystemUrl(config)).toBe('https://terminology.hl7.org/CodeSystem/empty-codesystem')
      expect(errorSpy).toHaveBeenCalledOnce()
      errorSpy.mockRestore()
    })
  })

  describe('matchStoredCodeInCache', () => {
    const CCAM = 'https://ccam'
    const item = (id: string, label: string, system = CCAM): Hierarchy<FhirItem> =>
      ({ id, label, system }) as Hierarchy<FhirItem>
    const cache = {
      [CCAM]: [
        item('001472.....', 'Noeud 001472'),
        item('001472.001', 'Enfant 001472'),
        item('JQGA004....1', 'Acte JQGA004')
      ]
    }

    it('returns the exact match when the stored code still exists', () => {
      const cacheExact = { [CCAM]: [item('001472', 'Exact 001472'), item('001472.....', 'Noeud')] }
      const stored = { id: '001472', label: '', system: CCAM }
      expect((matchStoredCodeInCache(stored, cacheExact, true) as Hierarchy<FhirItem>).label).toBe('Exact 001472')
    })

    it('prefers the padding node over a descendant for a re-encoded CCAM code', () => {
      // Le noeud `001472.....` (suffixe tout en points) doit gagner sur son enfant `001472.001`.
      const stored = { id: '001472', label: '', system: CCAM }
      expect((matchStoredCodeInCache(stored, cache, true) as Hierarchy<FhirItem>).label).toBe('Noeud 001472')
    })

    it('does not prefix-match when disabled (avoids CIM10 E11 -> E110)', () => {
      const cim = 'https://cim10'
      const cimCache = { [cim]: [item('E110', 'Diabète compliqué', cim)] }
      const stored = { id: 'E11', system: cim }
      expect(matchStoredCodeInCache(stored, cimCache, false)).toBe(stored)
    })

    it('returns the stored code untouched when nothing matches', () => {
      const stored = { id: 'ZZZZ999', system: CCAM }
      expect(matchStoredCodeInCache(stored, cache, true)).toBe(stored)
    })

    it('keeps a segmented act code as stored', () => {
      const segmented = {
        [CCAM]: [item('JQGA004...01', 'Acte 01'), item('JQGA004...04', 'Acte 04'), item('JQGA004-1201', 'Acte 1201')]
      }
      const stored = { id: 'JQGA004', label: '', system: CCAM }
      expect(matchStoredCodeInCache(stored, segmented, true)).toBe(stored)
    })
  })

  describe('expandStoredCodeInCache', () => {
    const CCAM = 'https://ccam'
    const item = (id: string): Hierarchy<FhirItem> => ({ id, label: id, system: CCAM }) as Hierarchy<FhirItem>
    const declensions = [item('JQGA004...01'), item('JQGA004...04'), item('JQGA004-1201')]

    it('expands a wildcard code into every declension held in cache', () => {
      const stored = { id: 'JQGA004*', system: CCAM }
      const result = expandStoredCodeInCache(stored, { [CCAM]: declensions }, true)
      expect(result.map((c) => c.id)).toEqual(['JQGA004...01', 'JQGA004...04', 'JQGA004-1201', 'JQGA004*'])
    })

    it('keeps the wildcard untouched when the cache holds no declension', () => {
      const stored = { id: 'JQGA004*', system: CCAM }
      expect(expandStoredCodeInCache(stored, { [CCAM]: [] }, true)).toEqual([stored])
    })

    it('does not expand a wildcard outside CCAM', () => {
      const stored = { id: 'JQGA004*', system: CCAM }
      const result = expandStoredCodeInCache(stored, { [CCAM]: declensions }, false)
      expect(result).toEqual([stored])
    })

    it('falls back to the single match for a code without wildcard', () => {
      const stored = { id: 'JQGA004...01', system: CCAM }
      const result = expandStoredCodeInCache(stored, { [CCAM]: declensions }, true)
      expect(result.map((c) => c.id)).toEqual(['JQGA004...01'])
    })
  })

  describe('expandStoredCodesInCache', () => {
    const CCAM = 'https://ccam'
    const item = (id: string): Hierarchy<FhirItem> => ({ id, label: id, system: CCAM }) as Hierarchy<FhirItem>
    const declensions = [
      'JQGA004-2101',
      'JQGA004-2104',
      'JQGA004-1101',
      'JQGA004-1204',
      'JQGA004...01',
      'JQGA004-2201',
      'JQGA004-2204',
      'JQGA004...04',
      'JQGA004-1201',
      'JQGA004-1104'
    ].map(item)

    it('checks every sibling of a migrated criterion without duplicating the stored ones', () => {
      const stored = [
        { id: 'JQGA004...04', system: CCAM },
        { id: 'JQGA004*', system: CCAM },
        { id: 'JQGA004...01', system: CCAM }
      ]
      const ids = expandStoredCodesInCache(stored, { [CCAM]: declensions }, true).map((code) => code.id)

      expect(new Set(ids).size).toBe(ids.length)
      declensions.forEach((declension) => expect(ids).toContain(declension.id))
      expect(ids).toContain('JQGA004*')
    })

    it('keeps the wildcard alongside a partially loaded cache', () => {
      const partial = { [CCAM]: [item('JQGA004...01'), item('JQGA004...04')] }
      const ids = expandStoredCodesInCache([{ id: 'JQGA004*', system: CCAM }], partial, true).map((code) => code.id)

      expect(ids).toEqual(['JQGA004...01', 'JQGA004...04', 'JQGA004*'])
    })
  })

  describe('findCodeByIdOrPrefix', () => {
    const item = (id: string): Hierarchy<FhirItem> => ({ id, label: id, system: 'https://ccam' }) as Hierarchy<FhirItem>

    it('returns the exact match first', () => {
      const list = [item('001472'), item('001472.....')]
      expect(findCodeByIdOrPrefix(list, '001472', true)?.id).toBe('001472')
    })

    it('returns undefined when no exact match and prefix is disabled', () => {
      expect(findCodeByIdOrPrefix([item('001472.....')], '001472', false)).toBeUndefined()
    })

    it('returns undefined for an empty id', () => {
      expect(findCodeByIdOrPrefix([item('001472.....')], '', true)).toBeUndefined()
    })

    it('prefers the padding node over a descendant', () => {
      const list = [item('001472.001'), item('001472.....'), item('001472.0012')]
      expect(findCodeByIdOrPrefix(list, '001472', true)?.id).toBe('001472.....')
    })

    it('leaves a segmented act code unresolved instead of electing one declension', () => {
      const list = [item('JQGA004...01'), item('JQGA004...04'), item('JQGA004-1201')]
      expect(findCodeByIdOrPrefix(list, 'JQGA004', true)).toBeUndefined()
    })

    it('returns undefined when a node has no padding successor', () => {
      const list = [item('001472.001'), item('001472.0012')]
      expect(findCodeByIdOrPrefix(list, '001472', true)).toBeUndefined()
    })

    it('ignores undefined entries in the list', () => {
      const list = [undefined, item('001472.....')]
      expect(findCodeByIdOrPrefix(list, '001472', true)?.id).toBe('001472.....')
    })
  })
})
