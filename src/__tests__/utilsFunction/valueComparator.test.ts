import { describe, it, expect } from 'vitest'
import { comparatorToFilter, filterToComparator, parseOccurence } from 'utils/valueComparator'
import { Comparators } from 'types/requestCriterias'

describe('valueComparator.comparatorToFilter', () => {
  it('mappe chaque comparateur vers sa chaîne de filtre', () => {
    expect(comparatorToFilter(Comparators.LESS)).toBe('lt')
    expect(comparatorToFilter(Comparators.LESS_OR_EQUAL)).toBe('le')
    expect(comparatorToFilter(Comparators.EQUAL)).toBe('')
    expect(comparatorToFilter(Comparators.GREATER)).toBe('gt')
    expect(comparatorToFilter(Comparators.GREATER_OR_EQUAL)).toBe('ge')
  })

  it('retourne une chaîne vide pour un comparateur non géré (BETWEEN)', () => {
    expect(comparatorToFilter(Comparators.BETWEEN)).toBe('')
  })

  it('retourne une chaîne vide pour une valeur falsy', () => {
    expect(comparatorToFilter('' as Comparators)).toBe('')
  })
})

describe('valueComparator.filterToComparator', () => {
  it('reconnaît les préfixes de filtre', () => {
    expect(filterToComparator('lt')).toBe(Comparators.LESS)
    expect(filterToComparator('le')).toBe(Comparators.LESS_OR_EQUAL)
    expect(filterToComparator('gt')).toBe(Comparators.GREATER)
    expect(filterToComparator('ge')).toBe(Comparators.GREATER_OR_EQUAL)
  })

  it('retourne EQUAL par défaut pour une chaîne non reconnue ou vide', () => {
    expect(filterToComparator('')).toBe(Comparators.EQUAL)
    expect(filterToComparator('eq')).toBe(Comparators.EQUAL)
    expect(filterToComparator('xyz')).toBe(Comparators.EQUAL)
  })

  it('reconnaît le préfixe même avec une valeur accolée', () => {
    expect(filterToComparator('ge5')).toBe(Comparators.GREATER_OR_EQUAL)
  })
})

describe('valueComparator.parseOccurence', () => {
  it('parse un comparateur avec valeur', () => {
    expect(parseOccurence('ge5')).toEqual({ comparator: Comparators.GREATER_OR_EQUAL, value: 5 })
    expect(parseOccurence('lt10')).toEqual({ comparator: Comparators.LESS, value: 10 })
    expect(parseOccurence('le2')).toEqual({ comparator: Comparators.LESS_OR_EQUAL, value: 2 })
    expect(parseOccurence('gt3')).toEqual({ comparator: Comparators.GREATER, value: 3 })
  })

  it('utilise GREATER_OR_EQUAL par défaut pour un nombre nu', () => {
    expect(parseOccurence('3')).toEqual({ comparator: Comparators.GREATER_OR_EQUAL, value: 3 })
  })

  it('gère le préfixe eq (mappé vers EQUAL)', () => {
    expect(parseOccurence('eq7')).toEqual({ comparator: Comparators.EQUAL, value: 7 })
  })

  it('gère les décimaux et les négatifs', () => {
    expect(parseOccurence('ge2.5')).toEqual({ comparator: Comparators.GREATER_OR_EQUAL, value: 2.5 })
    expect(parseOccurence('lt-4')).toEqual({ comparator: Comparators.LESS, value: -4 })
  })

  it('retourne la valeur par défaut {GREATER_OR_EQUAL, 1} pour une entrée invalide', () => {
    expect(parseOccurence('invalid')).toEqual({ comparator: Comparators.GREATER_OR_EQUAL, value: 1 })
    expect(parseOccurence('5abc')).toEqual({ comparator: Comparators.GREATER_OR_EQUAL, value: 1 })
  })
})
