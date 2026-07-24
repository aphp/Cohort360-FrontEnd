import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapRequestParamsToSearchCriteria, mapSearchCriteriasToRequestParams } from 'mappers/filters'
import { ResourceType } from 'types/requestCriterias'
import {
  Direction,
  GenderStatus,
  Order,
  PatientsFilters,
  SearchByTypes,
  SearchCriterias,
  VitalStatus
} from 'types/searchCriterias'

// Le mapping des patients ne fait aucun appel réseau: on peut tester le round-trip
// sans mocker les services. On mocke tout de même les dépendances lourdes utilisées
// par les autres branches importées par le module.
vi.mock('services/aphp/serviceValueSets', () => ({
  HIERARCHY_ROOT: '*',
  getChildrenFromCodes: vi.fn(),
  getCodeList: vi.fn().mockResolvedValue({ results: [] }),
  getHierarchyRoots: vi.fn()
}))

vi.mock('services/aphp/servicePerimeters', () => ({
  default: { getPerimeters: vi.fn().mockResolvedValue({ results: [], count: 0 }) }
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return {
    ...actual,
    getConfig: vi.fn(() => ({
      system: { fhirUrl: 'http://localhost/fhir' },
      core: {
        valueSets: { encounterStatus: { url: 'http://enc-status', codeSystemUrls: ['http://enc-status-cs'] } }
      }
    }))
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mapRequestParamsToSearchCriteria - PATIENT (entrées complètes)', () => {
  it('reconstruit les genres, statuts vitaux et l’ordre par défaut', async () => {
    const params = `${'gender'}=m,f&deceased=true,false`
    const result = await mapRequestParamsToSearchCriteria(params, ResourceType.PATIENT)

    const filters = result.filters as PatientsFilters
    expect(filters.genders).toEqual([GenderStatus.MALE, GenderStatus.FEMALE])
    expect(filters.vitalStatuses).toEqual([VitalStatus.DECEASED, VitalStatus.ALIVE])
    // ordre par défaut pour les patients
    expect(result.orderBy).toEqual({ orderBy: Order.FAMILY, orderDirection: Direction.ASC })
  })

  it('récupère le searchBy et le searchInput depuis les paramètres', async () => {
    const params = 'family=Dupont Martin'
    const result = await mapRequestParamsToSearchCriteria(params, ResourceType.PATIENT)
    expect(result.searchBy).toBe(SearchByTypes.FAMILY)
    expect(result.searchInput).toBe('Dupont Martin')
  })
})

describe('mapRequestParamsToSearchCriteria - PATIENT (entrées partielles / invalides)', () => {
  it('retourne des listes vides quand aucun filtre patient n’est fourni', async () => {
    const result = await mapRequestParamsToSearchCriteria('', ResourceType.PATIENT)
    const filters = result.filters as PatientsFilters
    expect(filters.genders).toEqual([])
    expect(filters.vitalStatuses).toEqual([])
    expect(filters.birthdatesRanges).toEqual([null, null])
    expect(result.searchBy).toBe(SearchByTypes.TEXT)
    expect(result.searchInput).toBe('')
  })

  it('mappe un code de genre inconnu vers OTHER_UNKNOWN (entrée invalide tolérée)', async () => {
    const result = await mapRequestParamsToSearchCriteria('gender=zzz', ResourceType.PATIENT)
    const filters = result.filters as PatientsFilters
    expect(filters.genders).toEqual([GenderStatus.OTHER_UNKNOWN])
  })

  it('gère un seul statut vital fourni', async () => {
    const result = await mapRequestParamsToSearchCriteria('deceased=true', ResourceType.PATIENT)
    const filters = result.filters as PatientsFilters
    expect(filters.vitalStatuses).toEqual([VitalStatus.DECEASED])
  })
})

describe('mapSearchCriteriasToRequestParams <-> mapRequestParamsToSearchCriteria (round-trip PATIENT)', () => {
  it('conserve genres et statuts vitaux après un aller-retour', async () => {
    const criterias: SearchCriterias<PatientsFilters> = {
      searchBy: SearchByTypes.TEXT,
      searchInput: '',
      orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
      filters: {
        genders: [GenderStatus.MALE, GenderStatus.FEMALE],
        vitalStatuses: [VitalStatus.DECEASED, VitalStatus.ALIVE],
        birthdatesRanges: [null, null]
      }
    }

    const params = mapSearchCriteriasToRequestParams(criterias, ResourceType.PATIENT, false)
    const back = await mapRequestParamsToSearchCriteria(params, ResourceType.PATIENT)
    const filters = back.filters as PatientsFilters

    expect(filters.genders).toEqual([GenderStatus.MALE, GenderStatus.FEMALE])
    expect(filters.vitalStatuses).toEqual([VitalStatus.DECEASED, VitalStatus.ALIVE])
  })
})

describe('mapRequestParamsToSearchCriteria - ordre par défaut selon la ressource', () => {
  it('IMAGING utilise study-date DESC', async () => {
    const result = await mapRequestParamsToSearchCriteria('', ResourceType.IMAGING)
    expect(result.orderBy.orderDirection).toBe(Direction.DESC)
    expect(result.orderBy.orderBy).toBe(Order.STUDY_DATE)
  })

  it('CONDITION utilise date DESC', async () => {
    const result = await mapRequestParamsToSearchCriteria('', ResourceType.CONDITION)
    expect(result.orderBy).toEqual({ orderBy: Order.DATE, orderDirection: Direction.DESC })
  })
})
