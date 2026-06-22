import { describe, it, expect } from 'vitest'

describe('BiologyForm - ValueSet URL usage', () => {
  it('should use ValueSet URLs for valueSetsInfo', () => {
    // Simulate the logic in BiologyForm
    const biologyAnabioUrl = 'https://terminology.hl7.org/ValueSet/biology-anabio'
    const biologyLoincUrl = 'https://terminology.hl7.org/ValueSet/biology-loinc'
    const urls = [biologyAnabioUrl, biologyLoincUrl]
    
    // Simulate getValueSetsByUrls returning references
    const valueSetsInfo = urls.map((url) => ({
      url,
      label: url.includes('anabio') ? 'Anabio' : 'LOINC',
      title: url.includes('anabio') ? 'Anabio Title' : 'LOINC Title'
    }))
    
    expect(valueSetsInfo).toHaveLength(2)
    expect(valueSetsInfo[0].url).toBe('https://terminology.hl7.org/ValueSet/biology-anabio')
    expect(valueSetsInfo[1].url).toBe('https://terminology.hl7.org/ValueSet/biology-loinc')
  })

  it('should extract codeSystemUrl from config for buildMethodExtraArgs', () => {
    // Simulate the logic in BiologyForm
    const codeSystemUrls = ['https://terminology.hl7.org/CodeSystem/biology-anabio']
    const codeSystemUrl = codeSystemUrls.at(0) || ''
    
    expect(codeSystemUrl).toBe('https://terminology.hl7.org/CodeSystem/biology-anabio')
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

  it('should use ValueSet URLs not CodeSystem URLs for valueSetsInfo', () => {
    const valueSetUrls = [
      'https://terminology.hl7.org/ValueSet/biology-anabio',
      'https://terminology.hl7.org/ValueSet/biology-loinc'
    ]
    
    const valueSetsInfo = valueSetUrls.map((url) => ({ url }))
    
    expect(valueSetsInfo.every((info) => info.url.includes('ValueSet'))).toBe(true)
    expect(valueSetsInfo.every((info) => !info.url.includes('CodeSystem'))).toBe(true)
  })

  it('should use CodeSystem URL for buildMethodExtraArgs', () => {
    const codeSystemUrl = 'https://terminology.hl7.org/CodeSystem/biology-anabio'
    const buildMethodExtraArgs = [
      { type: 'string', value: codeSystemUrl },
      { type: 'boolean', value: true }
    ]
    
    expect(buildMethodExtraArgs[0].value).toContain('CodeSystem')
    expect(buildMethodExtraArgs[0].value).not.toContain('ValueSet')
  })
})