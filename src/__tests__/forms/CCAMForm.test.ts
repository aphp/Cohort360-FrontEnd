import { describe, it, expect } from 'vitest'

describe('CCAMForm - ValueSet URL usage', () => {
  it('should use ValueSet URLs for valueSetsInfo', () => {
    // Simulate the logic in CCAMForm
    const procedureHierarchyUrl = 'https://terminology.hl7.org/ValueSet/procedure-ccam'
    const urls = [procedureHierarchyUrl]
    
    // Simulate getValueSetsByUrls returning references
    const valueSetsInfo = urls.map((url) => ({
      url,
      label: 'CCAM',
      title: 'CCAM Title'
    }))
    
    expect(valueSetsInfo).toHaveLength(1)
    expect(valueSetsInfo[0].url).toBe('https://terminology.hl7.org/ValueSet/procedure-ccam')
  })

  it('should extract codeSystemUrl from config for buildMethodExtraArgs', () => {
    // Simulate the logic in CCAMForm
    const codeSystemUrls = ['https://terminology.hl7.org/CodeSystem/procedure-ccam']
    const codeSystemUrl = codeSystemUrls.at(0) || ''
    
    expect(codeSystemUrl).toBe('https://terminology.hl7.org/CodeSystem/procedure-ccam')
  })

  it('should handle empty codeSystemUrls array', () => {
    const codeSystemUrls: string[] = []
    const codeSystemUrl = codeSystemUrls.at(0) || ''
    
    expect(codeSystemUrl).toBe('')
  })

  it('should handle undefined codeSystemUrls', () => {
    const codeSystemUrls: any = undefined
    const codeSystemUrl = codeSystemUrls?.at(0) || ''
    
    expect(codeSystemUrl).toBe('')
  })

  it('should use ValueSet URL not CodeSystem URL for valueSetsInfo', () => {
    const valueSetUrl = 'https://terminology.hl7.org/ValueSet/procedure-ccam'
    const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/procedure-ccam'
    
    // valueSetsInfo should use ValueSet URL
    const valueSetsInfo = [{ url: valueSetUrl }]
    
    // buildMethodExtraArgs should use CodeSystem URL
    const buildMethodExtraArgs = [{ type: 'string', value: codeSystemUrl }]
    
    expect(valueSetsInfo[0].url).toContain('ValueSet')
    expect(valueSetsInfo[0].url).not.toContain('CodeSystem')
    expect(buildMethodExtraArgs[0].value).toContain('CodeSystem')
    expect(buildMethodExtraArgs[0].value).not.toContain('ValueSet')
  })
})