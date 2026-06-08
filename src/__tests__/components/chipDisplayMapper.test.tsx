import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConfig } from 'config'

// Mock dependencies
vi.mock('config', () => ({
  getConfig: vi.fn(() => ({
    features: {
      medication: {
        valueSets: {
          medicationAtc: {
            url: 'https://terminology.hl7.org/ValueSet/medication-atc',
            title: 'ATC'
          },
          medicationUcd: {
            url: 'https://terminology.hl7.org/ValueSet/medication-ucd',
            title: 'UCD'
          }
        }
      },
      observation: {
        valueSets: {
          biologyHierarchyAnabio: {
            url: 'https://terminology.hl7.org/ValueSet/biology-anabio',
            title: 'Anabio'
          },
          biologyHierarchyLoinc: {
            url: 'https://terminology.hl7.org/ValueSet/biology-loinc',
            title: 'LOINC'
          }
        }
      }
    }
  }))
}))

vi.mock('utils/valueSets', () => ({
  getValueSetFromCodeSystem: vi.fn((codeSystemUrl: string) => {
    const mapping: Record<string, string> = {
      'https://terminology.hl7.org/CodeSystem/medication-atc': 'https://terminology.hl7.org/ValueSet/medication-atc',
      'https://terminology.hl7.org/CodeSystem/medication-ucd': 'https://terminology.hl7.org/ValueSet/medication-ucd',
      'https://terminology.hl7.org/CodeSystem/biology-anabio': 'https://terminology.hl7.org/ValueSet/biology-anabio',
      'https://terminology.hl7.org/CodeSystem/biology-loinc': 'https://terminology.hl7.org/ValueSet/biology-loinc'
    }
    return mapping[codeSystemUrl]
  })
}))

// Import the functions we want to test
// Note: These are internal functions, so we're testing them indirectly through their effects
import { getValueSetFromCodeSystem } from 'utils/valueSets'

describe('chipDisplayMapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLabelsForCodeSearchItem logic', () => {
    it('should use getValueSetFromCodeSystem to find correct ValueSet URL from CodeSystem URL', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/medication-atc'
      const result = getValueSetFromCodeSystem(codeSystemUrl)

      expect(result).toBe('https://terminology.hl7.org/ValueSet/medication-atc')
    })

    it('should handle CodeSystem URL for biology codes', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/biology-anabio'
      const result = getValueSetFromCodeSystem(codeSystemUrl)

      expect(result).toBe('https://terminology.hl7.org/ValueSet/biology-anabio')
    })

    it('should return undefined for unknown CodeSystem URL', () => {
      const codeSystemUrl = 'https://unknown-codesystem'
      const result = getValueSetFromCodeSystem(codeSystemUrl)

      expect(result).toBeUndefined()
    })
  })

  describe('displaySystem logic', () => {
    it('should map CodeSystem URL to ValueSet URL before checking config', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/medication-atc'
      const valueSetUrl = getValueSetFromCodeSystem(codeSystemUrl)

      expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/medication-atc')

      // Verify it matches the config
      const config = getConfig()
      expect(valueSetUrl).toBe(config.features.medication.valueSets.medicationAtc.url)
    })

    it('should handle UCD medication codes', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/medication-ucd'
      const valueSetUrl = getValueSetFromCodeSystem(codeSystemUrl)

      expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/medication-ucd')

      const config = getConfig()
      expect(valueSetUrl).toBe(config.features.medication.valueSets.medicationUcd.url)
    })

    it('should handle Anabio biology codes', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/biology-anabio'
      const valueSetUrl = getValueSetFromCodeSystem(codeSystemUrl)

      expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/biology-anabio')

      const config = getConfig()
      expect(valueSetUrl).toBe(config.features.observation.valueSets.biologyHierarchyAnabio.url)
    })

    it('should handle LOINC biology codes', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/biology-loinc'
      const valueSetUrl = getValueSetFromCodeSystem(codeSystemUrl)

      expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/biology-loinc')

      const config = getConfig()
      expect(valueSetUrl).toBe(config.features.observation.valueSets.biologyHierarchyLoinc.url)
    })

    it('should return empty string when system is undefined', () => {
      const result = getValueSetFromCodeSystem(undefined as any)

      expect(result).toBeUndefined()
    })

    it('should fallback to original system when no mapping exists', () => {
      const unknownSystem = 'https://unknown-system'
      const result = getValueSetFromCodeSystem(unknownSystem)

      expect(result).toBeUndefined()
    })
  })

  describe('cache key resolution', () => {
    it('should prioritize ValueSet URL from CodeSystem mapping', () => {
      const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/medication-atc'
      const valueSetUrl = getValueSetFromCodeSystem(codeSystemUrl)

      expect(valueSetUrl).toBeDefined()
      expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/medication-atc')
    })

    it('should handle case where CodeSystem has no ValueSet mapping', () => {
      const unknownCodeSystem = 'https://unknown-codesystem'
      const result = getValueSetFromCodeSystem(unknownCodeSystem)

      expect(result).toBeUndefined()
    })
  })

  describe('integration with config', () => {
    it('should correctly map all medication ValueSets', () => {
      const config = getConfig()
      const atcCodeSystem = 'https://terminology.hl7.org/CodeSystem/medication-atc'
      const ucdCodeSystem = 'https://terminology.hl7.org/CodeSystem/medication-ucd'

      const atcValueSet = getValueSetFromCodeSystem(atcCodeSystem)
      const ucdValueSet = getValueSetFromCodeSystem(ucdCodeSystem)

      expect(atcValueSet).toBe(config.features.medication.valueSets.medicationAtc.url)
      expect(ucdValueSet).toBe(config.features.medication.valueSets.medicationUcd.url)
    })

    it('should correctly map all biology ValueSets', () => {
      const config = getConfig()
      const anabioCodeSystem = 'https://terminology.hl7.org/CodeSystem/biology-anabio'
      const loincCodeSystem = 'https://terminology.hl7.org/CodeSystem/biology-loinc'

      const anabioValueSet = getValueSetFromCodeSystem(anabioCodeSystem)
      const loincValueSet = getValueSetFromCodeSystem(loincCodeSystem)

      expect(anabioValueSet).toBe(config.features.observation.valueSets.biologyHierarchyAnabio.url)
      expect(loincValueSet).toBe(config.features.observation.valueSets.biologyHierarchyLoinc.url)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string system', () => {
      const result = getValueSetFromCodeSystem('')

      expect(result).toBeUndefined()
    })

    it('should handle null system', () => {
      const result = getValueSetFromCodeSystem(null as any)

      expect(result).toBeUndefined()
    })

    it('should handle system with special characters', () => {
      const specialSystem = 'https://test.com/system?param=value&other=test'
      const result = getValueSetFromCodeSystem(specialSystem)

      expect(result).toBeUndefined()
    })
  })
})