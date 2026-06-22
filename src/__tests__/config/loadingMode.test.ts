import { describe, it, expect } from 'vitest'
import { isExpandLoadingMode } from 'config'

describe('isExpandLoadingMode', () => {
  it('returns true when loadingMode is "expand"', () => {
    expect(isExpandLoadingMode('expand')).toBe(true)
  })

  it('returns false when loadingMode is "list"', () => {
    expect(isExpandLoadingMode('list')).toBe(false)
  })

  it('returns false when loadingMode is undefined', () => {
    expect(isExpandLoadingMode(undefined)).toBe(false)
  })
})
