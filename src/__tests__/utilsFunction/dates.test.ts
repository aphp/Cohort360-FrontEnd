import { describe, it, expect } from 'vitest'
import moment from 'moment'
import {
  ISO_DATE_FORMAT,
  isDateValid,
  isEndBeforeStart,
  isIncompleteDate,
  isIncompleteDateText,
  toIsoDate
} from 'utils/dates'

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

describe('dates.isIncompleteDate', () => {
  it("un champ vide n'est pas incomplet", () => {
    expect(isIncompleteDate(null)).toBe(false)
  })
  it('une date invalide (section manquante) est incomplète', () => {
    expect(isIncompleteDate(moment.invalid())).toBe(true)
  })
  it('une année de moins de 4 chiffres est incomplète', () => {
    expect(isIncompleteDate(moment('01/10/0002', 'DD/MM/YYYY'))).toBe(true)
  })
  it("une date complète n'est pas incomplète", () => {
    expect(isIncompleteDate(moment('01/10/2026', 'DD/MM/YYYY'))).toBe(false)
  })
})

describe('dates.isIncompleteDateText', () => {
  it("un champ vide n'est pas incomplet", () => {
    expect(isIncompleteDateText('')).toBe(false)
  })
  it('une section manquante est incomplète', () => {
    expect(isIncompleteDateText('01/10/AAAA')).toBe(true)
  })
  it('une année de moins de 4 chiffres est incomplète', () => {
    expect(isIncompleteDateText('01/10/2')).toBe(true)
  })
  it("une date complète n'est pas incomplète", () => {
    expect(isIncompleteDateText('01/10/2026')).toBe(false)
  })
})

describe('dates.isEndBeforeStart', () => {
  it('vrai quand la fin est avant le début', () => {
    expect(isEndBeforeStart('2026-10-02', '2026-10-01')).toBe(true)
  })
  it('faux quand les deux dates sont égales', () => {
    expect(isEndBeforeStart('2026-10-01', '2026-10-01')).toBe(false)
  })
  it('faux quand la fin est après le début', () => {
    expect(isEndBeforeStart('2026-10-01', '2026-10-02')).toBe(false)
  })
  it('faux quand une des dates est vide', () => {
    expect(isEndBeforeStart(null, '2026-10-01')).toBe(false)
    expect(isEndBeforeStart('2026-10-01', undefined)).toBe(false)
  })
})
