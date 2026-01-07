import { birthdateRangeToAge, convertStringToDuration, substructDurationType } from 'utils/age'

describe('birthdateRangeToAge', () => {
  describe('null/undefined handling (prevents spurious filters)', () => {
    it('should return undefined for null range', () => {
      expect(birthdateRangeToAge(null, false)).toBeUndefined()
      expect(birthdateRangeToAge(null, true)).toBeUndefined()
    })

    it('should return undefined for undefined range', () => {
      expect(birthdateRangeToAge(undefined, false)).toBeUndefined()
      expect(birthdateRangeToAge(undefined, true)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(birthdateRangeToAge('', false)).toBeUndefined()
      expect(birthdateRangeToAge('', true)).toBeUndefined()
    })
  })

  describe('valid range handling', () => {
    it('should return age in days for non-deidentified mode', () => {
      // 1 year = ~365 days
      const result = birthdateRangeToAge('0/0/1', false)
      expect(result).toBeGreaterThanOrEqual(364)
      expect(result).toBeLessThanOrEqual(366)
    })

    it('should return age in months for deidentified mode', () => {
      // 1 year = 12 months
      const result = birthdateRangeToAge('0/0/1', true)
      expect(result).toBeGreaterThanOrEqual(11)
      expect(result).toBeLessThanOrEqual(13)
    })

    it('should handle complex durations (days/months/years)', () => {
      // 25 years, 6 months, 15 days
      const result = birthdateRangeToAge('15/6/25', false)
      expect(result).toBeDefined()
      expect(result).toBeGreaterThan(9000) // > 25 years in days
    })

    it('should handle zero duration (newborn)', () => {
      const result = birthdateRangeToAge('0/0/0', false)
      expect(result).toBeDefined()
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1) // 0-1 days
    })
  })
})

describe('convertStringToDuration', () => {
  it('should return null for null input', () => {
    expect(convertStringToDuration(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(convertStringToDuration(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(convertStringToDuration('')).toBeNull()
  })

  it('should parse valid duration string', () => {
    const result = convertStringToDuration('15/6/25')
    expect(result).toEqual({ day: 15, month: 6, year: 25 })
  })

  it('should handle partial durations', () => {
    const result = convertStringToDuration('0/0/18')
    expect(result).toEqual({ day: 0, month: 0, year: 18 })
  })
})
