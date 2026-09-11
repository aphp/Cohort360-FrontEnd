import { describe, it, expect } from 'vitest'
import {
  getAgeAphp,
  formatAge,
  getDurationRangeLabel,
  substructDurationType,
  substructAgeString,
  convertStringToDuration,
  convertDurationToString,
  checkMinMaxValue,
  convertDurationToTimestamp,
  convertTimestampToDuration
} from 'utils/age'

describe('age.convertStringToDuration', () => {
  it('convertit une chaîne jj/mm/aaaa en DurationType', () => {
    expect(convertStringToDuration('15/6/25')).toEqual({ day: 15, month: 6, year: 25 })
  })
  it('retourne null pour une entrée vide', () => {
    expect(convertStringToDuration(null)).toBeNull()
    expect(convertStringToDuration(undefined)).toBeNull()
    expect(convertStringToDuration('')).toBeNull()
  })
  it('remplit les parties manquantes par 0', () => {
    expect(convertStringToDuration('5')).toEqual({ day: 5, month: 0, year: 0 })
  })
})

describe('age.convertDurationToString', () => {
  it('convertit un DurationType en chaîne', () => {
    expect(convertDurationToString({ day: 15, month: 6, year: 25 })).toBe('15/6/25')
  })
  it('retourne null quand tout est nul', () => {
    expect(convertDurationToString({ year: null, month: null, day: null } as never)).toBeNull()
  })
  it('retourne null quand année 0 sans mois ni jour', () => {
    expect(convertDurationToString({ year: 0, month: 0, day: 0 })).toBeNull()
  })
})

describe('age.convertDurationToTimestamp', () => {
  it('calcule le timestamp en mode identifié (365j/an, 30j/mois)', () => {
    expect(convertDurationToTimestamp({ year: 1, month: 6, day: 15 }, false)).toBe(365 + 180 + 15)
  })
  it('calcule le timestamp en mode dé-identifié (12 mois/an)', () => {
    expect(convertDurationToTimestamp({ year: 1, month: 6, day: 15 }, true)).toBe(12 + 6 + 15)
  })
  it('retourne null pour une durée nulle', () => {
    expect(convertDurationToTimestamp(null)).toBeNull()
  })
})

describe('age.convertTimestampToDuration', () => {
  it('reconvertit un timestamp identifié en durée', () => {
    expect(convertTimestampToDuration(560, false)).toEqual({ year: 1, month: 6, day: 15 })
  })
  it('reconvertit un timestamp dé-identifié (sans jours)', () => {
    expect(convertTimestampToDuration(18, true)).toEqual({ year: 1, month: 6, day: 0 })
  })
  it('retourne une durée nulle pour 0/null', () => {
    expect(convertTimestampToDuration(null)).toEqual({ year: 0, month: 0, day: 0 })
  })
})

describe('age.formatAge', () => {
  it('reformate une date d’un format à un autre', () => {
    expect(formatAge('25/12/1990', 'DD/MM/YYYY', 'YYYY-MM-DD')).toBe('1990-12-25')
  })
  it('lève une erreur pour un format invalide', () => {
    expect(() => formatAge('bad', 'DD/MM/YYYY', 'YYYY-MM-DD')).toThrow()
  })
})

describe('age.getAgeAphp', () => {
  it('retourne "< 1 mois" pour 0 mois', () => {
    expect(getAgeAphp(0, 'months')).toBe('< 1 mois')
  })
  it('retourne "Âge inconnu" pour undefined', () => {
    expect(getAgeAphp(undefined, 'days')).toBe('Âge inconnu')
  })
  it('retourne une chaîne d’âge pour une valeur en jours', () => {
    expect(typeof getAgeAphp(400, 'days')).toBe('string')
  })
})

describe('age.getDurationRangeLabel', () => {
  it('formate une plage complète', () => {
    const label = getDurationRangeLabel(['1/0/25', '1/0/65'], 'Âge')
    expect(label).toContain('Âge entre')
    expect(label).toContain('25 an(s)')
    expect(label).toContain('65 an(s)')
  })
  it('formate une borne minimale seule', () => {
    const label = getDurationRangeLabel(['0/0/18', null], 'Âge')
    expect(label).toContain('à partir de')
  })
  it('formate une borne maximale seule', () => {
    const label = getDurationRangeLabel([null, '0/0/99'], 'Âge')
    expect(label).toContain('au maximum de')
  })
})

describe('age.checkMinMaxValue', () => {
  it('accepte min <= max', () => {
    expect(checkMinMaxValue({ year: 18, month: 0, day: 0 }, { year: 65, month: 0, day: 0 })).toBe(true)
  })
  it('refuse min > max', () => {
    expect(checkMinMaxValue({ year: 65, month: 0, day: 0 }, { year: 18, month: 0, day: 0 })).toBe(false)
  })
  it('accepte quand une borne est entièrement nulle', () => {
    expect(
      checkMinMaxValue({ year: null, month: null, day: null } as never, { year: 30, month: 0, day: 0 })
    ).toBe(true)
  })
})

describe('age.substructDurationType / substructAgeString', () => {
  it('soustrait une durée de la date du jour', () => {
    const date = substructDurationType({ year: 10, month: 0, day: 0 })
    const expectedYear = new Date().getUTCFullYear() - 10
    expect(date.getFullYear()).toBe(expectedYear)
  })
  it('substructAgeString accepte une chaîne', () => {
    const date = substructAgeString('0/0/5')
    expect(date instanceof Date).toBe(true)
    expect(date.getFullYear()).toBe(new Date().getUTCFullYear() - 5)
  })
})
