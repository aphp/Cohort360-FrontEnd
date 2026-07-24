import { describe, it, expect } from 'vitest'
import {
  isChecked,
  removeElementInArray,
  addElementInArray,
  toggleFilter,
  removeFilter,
  getFilterLabel
} from 'utils/filters'
import { FilterKeys, GenderStatus, VitalStatus } from 'types/searchCriterias'
import { CohortsType } from 'types/cohorts'

describe('utils/filters - helpers de tableau', () => {
  it('isChecked détecte la présence', () => {
    expect(isChecked(2, [1, 2, 3])).toBe(true)
    expect(isChecked(9, [1, 2, 3])).toBe(false)
  })

  it('removeElementInArray retire la valeur', () => {
    expect(removeElementInArray([1, 2, 3], 2)).toEqual([1, 3])
  })

  it('addElementInArray ajoute la valeur', () => {
    expect(addElementInArray([1, 2], 3)).toEqual([1, 2, 3])
  })

  it('toggleFilter bascule la présence', () => {
    expect(toggleFilter([1, 2], 2)).toEqual([1])
    expect(toggleFilter([1, 2], 3)).toEqual([1, 2, 3])
  })
})

describe('utils/filters - removeFilter', () => {
  it('retire un élément d’un filtre tableau (GENDERS)', () => {
    const filters = { genders: [GenderStatus.MALE, GenderStatus.FEMALE] } as never
    const result = removeFilter(FilterKeys.GENDERS, GenderStatus.MALE, filters) as { genders: GenderStatus[] }
    expect(result.genders).toEqual([GenderStatus.FEMALE])
  })

  it('retire une valeur d’un filtre chaîne séparée par des virgules (NDA)', () => {
    const filters = { nda: 'a,b,c' } as never
    const result = removeFilter(FilterKeys.NDA, 'b', filters) as { nda: string }
    expect(result.nda).toBe('a,c')
  })

  it('réinitialise une plage de durée à [null, null]', () => {
    const filters = { durationRange: ['2020', '2021'] } as never
    const result = removeFilter(FilterKeys.DURATION_RANGE, '2020', filters) as { durationRange: [null, null] }
    expect(result.durationRange).toEqual([null, null])
  })

  it('réinitialise une date à null', () => {
    const filters = { startDate: '2020-01-01' } as never
    const result = removeFilter(FilterKeys.START_DATE, '2020-01-01', filters) as { startDate: null }
    expect(result.startDate).toBeNull()
  })

  it('réinitialise onlyPdfAvailable à false', () => {
    const filters = { onlyPdfAvailable: true } as never
    const result = removeFilter(FilterKeys.ONLY_PDF_AVAILABLE, true as never, filters) as { onlyPdfAvailable: boolean }
    expect(result.onlyPdfAvailable).toBe(false)
  })

  it('ne modifie rien si la clé est absente', () => {
    const filters = { genders: [GenderStatus.MALE] } as never
    const result = removeFilter(FilterKeys.NDA, 'x', filters) as { genders: GenderStatus[] }
    expect(result.genders).toEqual([GenderStatus.MALE])
  })
})

describe('utils/filters - getFilterLabel', () => {
  it('formate le libellé favori', () => {
    expect(getFilterLabel(FilterKeys.FAVORITE, CohortsType.FAVORITE)).toBeTruthy()
  })

  it('formate le statut vital', () => {
    expect(getFilterLabel(FilterKeys.VITAL_STATUSES, VitalStatus.ALIVE)).toBeTruthy()
  })

  it('formate NDA et IPP avec préfixe', () => {
    expect(getFilterLabel(FilterKeys.NDA, '123')).toBe('NDA : 123')
    expect(getFilterLabel(FilterKeys.IPP, '456')).toBe('IPP : 456')
  })

  it('formate le nombre de patients min/max', () => {
    expect(getFilterLabel(FilterKeys.MIN_PATIENTS, 10 as never)).toContain('10')
    expect(getFilterLabel(FilterKeys.MAX_PATIENTS, 100 as never)).toContain('100')
  })

  it('formate la source (dernier segment en majuscule)', () => {
    expect(getFilterLabel(FilterKeys.SOURCE, 'sys/orbis')).toBe('Source : ORBIS')
  })

  it('retourne une chaîne vide pour une clé non gérée', () => {
    expect(getFilterLabel('cléInconnue' as FilterKeys, 'x')).toBe('')
  })
})
