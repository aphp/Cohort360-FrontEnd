import { describe, it, expect } from 'vitest'
import moment from 'moment'
import { ISO_DATE_FORMAT, isDateValid, toIsoDate } from 'utils/dates'

describe('dates.toIsoDate', () => {
  it('formate un Moment valide en YYYY-MM-DD', () => {
    expect(toIsoDate(moment('10/09/2026', 'DD/MM/YYYY'))).toBe('2026-09-10')
  })
  it('retourne null pour une date invalide', () => {
    expect(toIsoDate(moment('31/02/2026', 'DD/MM/YYYY', true))).toBeNull()
  })
  it('retourne null pour une date absente', () => {
    expect(toIsoDate(null)).toBeNull()
  })
})

describe('dates.isDateValid', () => {
  it('utilise ISO_DATE_FORMAT par défaut', () => {
    expect(ISO_DATE_FORMAT).toBe('YYYY-MM-DD')
    expect(isDateValid('2026-09-10')).toBe(true)
    expect(isDateValid('10/09/2026')).toBe(false)
  })
})
