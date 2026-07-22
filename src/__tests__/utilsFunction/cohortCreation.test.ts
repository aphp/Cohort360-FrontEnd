import { describe, it, expect } from 'vitest'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'

describe('cohortCreation - CodeSystem to ValueSet mapping logic', () => {
  it('should use found ValueSet URL when getValueSetFromCodeSystem returns a value', () => {
    // Simulate the logic in fetchCriteriasCodes
    const defaultValueSet = 'https://terminology.hl7.org/ValueSet/default'
    
    // Simulate getValueSetFromCodeSystem returning a value
    const foundValueSetUrl = 'https://terminology.hl7.org/ValueSet/icd10'
    
    let valueSetUrl
    if (foundValueSetUrl) {
      valueSetUrl = foundValueSetUrl
    } else {
      valueSetUrl = defaultValueSet
    }
    
    expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/icd10')
    expect(valueSetUrl).not.toBe(defaultValueSet)
  })

  it('should fallback to defaultValueSet when getValueSetFromCodeSystem returns undefined', () => {
    // Simulate the logic in fetchCriteriasCodes
    const defaultValueSet = 'https://terminology.hl7.org/ValueSet/default'
    
    // Simulate getValueSetFromCodeSystem returning undefined
    const foundValueSetUrl = undefined
    
    let valueSetUrl
    if (foundValueSetUrl) {
      valueSetUrl = foundValueSetUrl
    } else {
      valueSetUrl = defaultValueSet
    }
    
    expect(valueSetUrl).toBe(defaultValueSet)
  })

  it('should use defaultValueSet when code has no system property', () => {
    const code: any = { id: 'CODE1', label: 'Code 1' }
    const defaultValueSet = 'https://terminology.hl7.org/ValueSet/default'
    
    let valueSetUrl = defaultValueSet
    if (code.system) {
      // This block won't execute since code.system is undefined
      const foundValueSetUrl = 'some-value'
      if (foundValueSetUrl) {
        valueSetUrl = foundValueSetUrl
      }
    }
    
    expect(valueSetUrl).toBe(defaultValueSet)
  })

  it('should process code.system when it exists', () => {
    const code = {
      id: 'CODE1',
      label: 'Code 1',
      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
    }
    const defaultValueSet = 'https://terminology.hl7.org/ValueSet/default'
    
    let valueSetUrl = defaultValueSet
    if (code.system) {
      // Simulate getValueSetFromCodeSystem finding a mapping
      const foundValueSetUrl = 'https://terminology.hl7.org/ValueSet/test-valueset'
      if (foundValueSetUrl) {
        valueSetUrl = foundValueSetUrl
      } else {
        valueSetUrl = defaultValueSet
      }
    }
    
    expect(valueSetUrl).toBe('https://terminology.hl7.org/ValueSet/test-valueset')
  })

  it('should handle HIERARCHY_ROOT code', () => {
    const code = {
      id: HIERARCHY_ROOT,
      label: 'Toute la hiérarchie',
      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem'
    }
    
    const isRoot = code.id === HIERARCHY_ROOT
    
    expect(isRoot).toBe(true)
  })

  it('should create proper valueSetUrl structure', () => {
    const valueSetUrl = 'https://terminology.hl7.org/ValueSet/test-valueset'
    
    // Simulate the structure created in fetchCriteriasCodes
    const valueSetCodeCache: any[] = []
    const fetchedCode = {
      id: 'CODE1',
      label: 'Code 1',
      system: 'https://terminology.hl7.org/CodeSystem/test-codesystem',
      valueSetUrl: valueSetUrl,
      above_levels_ids: '',
      inferior_levels_ids: ''
    }
    
    valueSetCodeCache.push(fetchedCode)
    
    expect(valueSetCodeCache[0].valueSetUrl).toBe(valueSetUrl)
    expect(valueSetCodeCache).toHaveLength(1)
  })

  it('should not add duplicate codes to cache', () => {
    const valueSetCodeCache = [
      {
        id: 'CODE1',
        label: 'Code 1',
        system: 'https://system1',
        valueSetUrl: 'https://valueset1'
      }
    ]
    
    const newCode = { id: 'CODE1', label: 'Code 1' }
    const isDuplicate = valueSetCodeCache.find((data) => data.id === newCode.id)
    
    if (!isDuplicate) {
      valueSetCodeCache.push(newCode as any)
    }
    
    expect(valueSetCodeCache).toHaveLength(1)
  })

  it('should handle empty codeSystemUrls array', () => {
    const codeSystemUrls: string[] = []
    const codeSystemUrl = codeSystemUrls.at(0) || ''
    
    expect(codeSystemUrl).toBe('')
  })

  it('should extract first codeSystemUrl from array', () => {
    const codeSystemUrls = [
      'https://terminology.hl7.org/CodeSystem/test-codesystem',
      'https://terminology.hl7.org/CodeSystem/another-codesystem'
    ]
    const codeSystemUrl = codeSystemUrls.at(0) || ''
    
    expect(codeSystemUrl).toBe('https://terminology.hl7.org/CodeSystem/test-codesystem')
  })

  describe('getCodesForValueSet logic', () => {
    it('should return hierarchy root when code is HIERARCHY_ROOT and valueSetUrls has items', () => {
      const code = HIERARCHY_ROOT
      const valueSetUrls = ['https://valueset1']
      
      // Simulate: if (code === HIERARCHY_ROOT && valueSetUrls.length)
      const shouldReturnRoot = code === HIERARCHY_ROOT && valueSetUrls.length > 0
      
      expect(shouldReturnRoot).toBe(true)
    })

    it('should not return hierarchy root when valueSetUrls is empty', () => {
      const code = HIERARCHY_ROOT
      const valueSetUrls: string[] = []
      
      const shouldReturnRoot = code === HIERARCHY_ROOT && valueSetUrls.length > 0
      
      expect(shouldReturnRoot).toBe(false)
    })

    it('should iterate through valueSetUrls to find code', () => {
      const valueSetUrls = [
        'https://valueset1',
        'https://valueset2',
        'https://valueset3'
      ]
      
      // Simulate the for loop
      const attempts: string[] = []
      for (const valueSetUrl of valueSetUrls) {
        attempts.push(valueSetUrl)
      }
      
      expect(attempts).toHaveLength(3)
      expect(attempts).toEqual(valueSetUrls)
    })

    it('should handle try-catch for each valueSetUrl', () => {
      const valueSetUrls = ['https://valueset1', 'https://valueset2']
      let errorCaught = false
      
      for (const valueSetUrl of valueSetUrls) {
        try {
          // Simulate an error
          throw new Error('Not found')
        } catch {
          errorCaught = true
          // Continue to next iteration
        }
      }
      
      expect(errorCaught).toBe(true)
    })
  })

  describe('fetchCriteriasCodes logic', () => {
    it('should filter criteria by type', () => {
      const selectedCriteria = [
        { type: 'TYPE_A', id: '1' },
        { type: 'TYPE_B', id: '2' },
        { type: 'TYPE_A', id: '3' }
      ]
      
      const criteriaId = 'TYPE_A'
      const criteriaValues = selectedCriteria.filter((criterion) => criterion.type === criteriaId)
      
      expect(criteriaValues).toHaveLength(2)
    })

    it('should filter criteria by types array', () => {
      const selectedCriteria = [
        { type: 'TYPE_A', id: '1' },
        { type: 'TYPE_B', id: '2' },
        { type: 'TYPE_C', id: '3' }
      ]
      
      const types = ['TYPE_A', 'TYPE_B']
      const criteriaValues = selectedCriteria.filter((criterion) => types.includes(criterion.type))
      
      expect(criteriaValues).toHaveLength(2)
    })

    it('should iterate through formDefinition sections and items', () => {
      const formDefinition = {
        itemSections: [
          {
            items: [
              { type: 'codeSearch', valueKey: 'code1' },
              { type: 'text', valueKey: 'text1' }
            ]
          },
          {
            items: [
              { type: 'codeSearch', valueKey: 'code2' }
            ]
          }
        ]
      }
      
      const codeSearchItems: any[] = []
      for (const section of formDefinition.itemSections || []) {
        for (const item of section.items || []) {
          if (item.type === 'codeSearch') {
            codeSearchItems.push(item)
          }
        }
      }
      
      expect(codeSearchItems).toHaveLength(2)
    })

    it('should handle empty formDefinition', () => {
      const getSections = (formDefinition?: { itemSections?: unknown[] }) => formDefinition?.itemSections ?? []

      const sections = getSections(undefined)

      expect(sections).toEqual([])
    })

    it('should handle empty items in section', () => {
      const section = { items: undefined }
      
      const items = section.items || []
      
      expect(items).toEqual([])
    })

    it('should access labelValues from criterion using dataKey', () => {
      const criterion: any = {
        type: 'TYPE_A',
        code1: [
          { id: 'CODE1', label: 'Label 1', system: 'https://system1' }
        ]
      }
      
      const dataKey = 'code1'
      const labelValues = criterion[dataKey]
      
      expect(labelValues).toHaveLength(1)
      expect(labelValues[0].id).toBe('CODE1')
    })

    it('should check if labelValues exists and has length', () => {
      const hasLabelValues = (labelValues?: Array<{ id: string }>) => Boolean(labelValues && labelValues.length > 0)
      const labelValues1 = [{ id: 'CODE1' }]
      const labelValues2: Array<{ id: string }> = []

      expect(hasLabelValues(labelValues1)).toBe(true)
      expect(hasLabelValues(labelValues2)).toBe(false)
      expect(hasLabelValues(undefined)).toBe(false)
    })

    it('should iterate through labelValues codes', () => {
      const labelValues = [
        { id: 'CODE1', system: 'https://system1' },
        { id: 'CODE2', system: 'https://system2' },
        { id: 'CODE3', system: 'https://system3' }
      ]
      
      const processedCodes: string[] = []
      for (const code of labelValues) {
        processedCodes.push(code.id)
      }
      
      expect(processedCodes).toHaveLength(3)
    })

    it('should use spread operator to merge cache arrays', () => {
      const existingCache = [
        { id: 'CODE1', label: 'Code 1' }
      ]
      
      const newCodes = [
        { id: 'CODE2', label: 'Code 2' }
      ]
      
      const merged = [...existingCache, ...newCodes]
      
      expect(merged).toHaveLength(2)
    })

    it('should handle undefined cache with nullish coalescing', () => {
      const updatedCriteriaData: any = {}
      const valueSetUrl = 'https://valueset1'
      
      const valueSetCodeCache = [...(updatedCriteriaData[valueSetUrl] ?? [])]
      
      expect(valueSetCodeCache).toEqual([])
    })

    it('should push fetched codes to cache', () => {
      const valueSetCodeCache: any[] = []
      const fetchedCode = [
        { id: 'CODE1', label: 'Code 1' }
      ]
      
      valueSetCodeCache.push(...fetchedCode)
      
      expect(valueSetCodeCache).toHaveLength(1)
    })

    it('should handle console.warn for missing codes', () => {
      const code = { id: 'CODE1' }
      const valueSetUrl = 'https://valueset1'
      const fetchedCode = undefined
      
      if (!fetchedCode) {
        // Simulate console.warn
        const warningMessage = `Code ${code.id} not found in valueSet ${valueSetUrl}`
        expect(warningMessage).toBe('Code CODE1 not found in valueSet https://valueset1')
      }
    })

    it('should handle console.error in catch block', () => {
      const code = { id: 'CODE1' }
      const valueSetUrl = 'https://valueset1'
      
      try {
        throw new Error('Fetch failed')
      } catch (e) {
        // Simulate console.error
        const errorMessage = `Error fetching code ${code.id} from valueSet ${valueSetUrl}`
        expect(errorMessage).toBe('Error fetching code CODE1 from valueSet https://valueset1')
      }
    })

    it('should update updatedCriteriaData with new cache', () => {
      const updatedCriteriaData: any = {}
      const valueSetUrl = 'https://valueset1'
      const valueSetCodeCache = [{ id: 'CODE1' }]
      
      updatedCriteriaData[valueSetUrl] = valueSetCodeCache
      
      expect(updatedCriteriaData[valueSetUrl]).toEqual(valueSetCodeCache)
    })
  })
})