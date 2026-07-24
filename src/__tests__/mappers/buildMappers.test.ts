import { describe, it, expect, beforeEach, vi } from 'vitest'

// buildMappers dépend de services.perimeters pour la résolution des unités
// exécutrices; on le mocke. Les autres mappers sont purs.
const getPerimeters = vi.fn(async (..._a: any[]) => ({ results: [{ id: 'svc1', name: 'Service 1' }], count: 1 }))

vi.mock('services/aphp', () => ({
  default: { perimeters: { getPerimeters: (...a: any[]) => getPerimeters(...a) } }
}))

import { BUILD_MAPPERS, UNBUILD_MAPPERS } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers/buildMappers'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BUILD_MAPPERS.buildSelect', () => {
  it('joint les valeurs avec un préfixe hiérarchie', () => {
    const result = BUILD_MAPPERS.buildSelect(['a', 'b'] as never, '' as never, false, ['http://sys'])
    expect(result).toBe('http://sys|a,http://sys|b')
  })
  it('retourne une chaîne vide pour null', () => {
    expect(BUILD_MAPPERS.buildSelect(null as never, '' as never, false, [])).toBe('')
  })
})

describe('BUILD_MAPPERS.buildLabelObject', () => {
  it('construit un filtre avec system|id', () => {
    const val = [{ id: 'X', system: 'urn:s', label: '' }]
    const result = BUILD_MAPPERS.buildLabelObject(val as never, '' as never, false, [])
    expect(result).toBe('urn:s|X')
  })
  it('gère le joker * avec l’url de hiérarchie', () => {
    const val = [{ id: '*', label: '' }]
    const result = BUILD_MAPPERS.buildLabelObject(val as never, '' as never, false, ['http://h'])
    expect(result).toBe('http://h|*')
  })
  it('retourne une chaîne vide pour une liste vide', () => {
    expect(BUILD_MAPPERS.buildLabelObject([] as never, '' as never, false, [])).toBe('')
  })
})

describe('BUILD_MAPPERS.buildEncounterService', () => {
  it('joint les ids des services', () => {
    const val = [{ id: 's1' }, { id: 's2' }]
    expect(BUILD_MAPPERS.buildEncounterService(val as never, '' as never, false, [])).toBe('s1,s2')
  })
  it('retourne une chaîne vide sans service', () => {
    expect(BUILD_MAPPERS.buildEncounterService([] as never, '' as never, false, [])).toBe('')
  })
})

describe('BUILD_MAPPERS.buildDate', () => {
  it('construit les bornes ge/le', () => {
    const val = { start: '2020-01-01', end: '2020-12-31', includeNull: false }
    const result = BUILD_MAPPERS.buildDate(val as never, 'date' as never, false, [false, false]) as string[]
    expect(result.some((v) => v.startsWith('ge2020-01-01'))).toBe(true)
    expect(result.some((v) => v.startsWith('le2020-12-31'))).toBe(true)
  })
  it('génère un filtre includeNull', () => {
    const val = { start: '2020-01-01', end: null, includeNull: true }
    const result = BUILD_MAPPERS.buildDate(val as never, 'date' as never, false, [false, false]) as {
      filterKey: string
      filterValue: string
    }
    expect(result.filterKey).toBe('_filter')
    expect(result.filterValue).toContain('or not')
  })
})

describe('BUILD_MAPPERS.buildSearch / buildRaw / noop', () => {
  it('buildRaw renvoie la valeur brute', () => {
    expect(BUILD_MAPPERS.buildRaw('abc' as never, '' as never, false, [])).toBe('abc')
  })
  it('noop renvoie undefined', () => {
    expect(BUILD_MAPPERS.noop('x' as never, '' as never, false, [])).toBeUndefined()
  })
})

describe('UNBUILD_MAPPERS.unbuildLabelObject', () => {
  it('reconstruit des LabelObject depuis system|id', async () => {
    const result = (await UNBUILD_MAPPERS.unbuildLabelObject('urn:s|X,urn:t|Y', false, null as never, '', [])) as Array<{
      id: string
      system?: string
    }>
    expect(result).toEqual([
      { id: 'X', system: 'urn:s', label: '' },
      { id: 'Y', system: 'urn:t', label: '' }
    ])
  })
})

describe('UNBUILD_MAPPERS.unbuildSelect', () => {
  it('découpe une liste séparée par des virgules', async () => {
    const result = await UNBUILD_MAPPERS.unbuildSelect('a, b ,c', false, [] as never, '', [])
    expect(result).toEqual(['a', 'b', 'c'])
  })
})

describe('UNBUILD_MAPPERS.unbuildComparator', () => {
  it('parse une occurrence', async () => {
    const result = await UNBUILD_MAPPERS.unbuildComparator('ge5', false, null as never, '', [])
    expect(result).toMatchObject({ value: 5 })
  })
})

describe('UNBUILD_MAPPERS.unbuildFromKey / unbuildBooleanFromDataNonNullStatus', () => {
  it('unbuildFromKey renvoie la clé fhir', async () => {
    expect(await UNBUILD_MAPPERS.unbuildFromKey('v', false, null as never, 'maClé', [])).toBe('maClé')
  })
  it('unbuildBooleanFromDataNonNullStatus renvoie un booléen', async () => {
    expect(await UNBUILD_MAPPERS.unbuildBooleanFromDataNonNullStatus('x', false, null as never, '', [])).toBe(true)
    expect(await UNBUILD_MAPPERS.unbuildBooleanFromDataNonNullStatus('', false, null as never, '', [])).toBe(false)
  })
})

describe('UNBUILD_MAPPERS.unbuildEncounterService', () => {
  it('résout les services via le service perimeters', async () => {
    const result = (await UNBUILD_MAPPERS.unbuildEncounterService('svc1', false, [] as never, '', [])) as Array<{
      id: string
    }>
    expect(getPerimeters).toHaveBeenCalledWith(expect.objectContaining({ ids: 'svc1' }))
    expect(result[0].id).toBe('svc1')
  })

  it('retourne la valeur existante quand pas de valeur', async () => {
    const existing = [{ id: 'prev' }] as never
    const result = await UNBUILD_MAPPERS.unbuildEncounterService('', false, existing, '', [])
    expect(result).toEqual(existing)
  })
})

describe('UNBUILD_MAPPERS.unbuildDate', () => {
  it('reconstruit une plage de dates depuis ge/le', async () => {
    const result = (await UNBUILD_MAPPERS.unbuildDate('ge2020-01-01,le2020-12-31', false, undefined as never, '', [])) as {
      start: string | null
      end: string | null
    }
    expect(result.start).toContain('2020-01-01')
    expect(result.end).toContain('2020-12-31')
  })
})
