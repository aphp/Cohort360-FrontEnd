import { describe, it, expect } from 'vitest'
import { getMfaNoticePhase } from 'views/Login/mfaNoticePhase'

describe('getMfaNoticePhase', () => {
  it.each([
    ['2026-10-21T23:59:59+02:00', 'none'],
    ['2026-10-21T22:00:00Z', 'announcement'], // 22/10 00:00 à Paris
    ['2026-10-28T23:59:59+01:00', 'announcement'],
    ['2026-10-28T23:00:00Z', 'activated'], // 29/10 00:00 à Paris
    ['2026-11-11T23:59:59+01:00', 'activated'],
    ['2026-11-11T23:00:00Z', 'help'], // 12/11 00:00 à Paris
    ['2030-01-01T00:00:00+01:00', 'help']
  ])('%s → %s', (date, expected) => {
    expect(getMfaNoticePhase(new Date(date))).toBe(expected)
  })
})
