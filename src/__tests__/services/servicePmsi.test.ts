import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { Condition, Procedure } from 'fhir/r4'
import { updateConfig } from 'config'
import { Direction, Order, PMSIFilters } from 'types/searchCriterias'
import { FetchParams, Patient as PatientType, PMSI_INCLUDE_PAGE_SIZE } from 'types/exploration'

// Same low-level mocking approach as __tests__/services/callApi.test.ts: mock
// apiFhir.fhirSearch directly so we can assert on the *actual wire-level* request
// options (`_count`, `_offset`, `_include`, ...), independent of any refactor in
// the layers in between.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fhirSearch = vi.fn((..._args: any[]) => Promise.resolve({ data: { resourceType: 'Bundle', total: 0 } }))

vi.mock('../../services/apiFhir', () => ({
  default: { get: vi.fn(async () => ({ data: {} })) },
  fhirSearch: (...args: unknown[]) => fhirSearch(...args)
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return { ...actual }
})

import { fetchConditionList, fetchProcedureList, fetchLastPmsi } from 'services/aphp/servicePmsi'

const ORBIS_STATUS_URL = 'http://test.aphp.fr/fhir/StructureDefinition/orbis-status'

const callsFor = (resource: string) => fhirSearch.mock.calls.filter((call) => call[0] === resource)
const optionsOf = (call: unknown[]) => (call[1] as string[]).join('&')

beforeAll(() => {
  updateConfig({ features: { condition: { extensions: { orbisStatus: ORBIS_STATUS_URL } } } })
})

beforeEach(() => {
  vi.clearAllMocks()
})

const emptyFilters: PMSIFilters = {
  executiveUnits: [],
  encounterStatus: [],
  code: [],
  durationRange: [null, null]
}

const baseFetchParams: FetchParams = {
  size: 20,
  page: 0,
  searchInput: '',
  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
  includeFacets: false
}

const makePatient = (id: string): PatientType =>
  ({
    id,
    deidentified: false,
    infos: { id, hospits: [] }
  }) as unknown as PatientType

const makeCondition = (id: string, isDp: boolean): Condition => ({
  resourceType: 'Condition',
  id,
  subject: { reference: 'Patient/p1' },
  extension: isDp ? [{ url: ORBIS_STATUS_URL, valueString: 'DP' }] : []
})

const makeProcedure = (id: string): Procedure => ({
  resourceType: 'Procedure',
  id,
  status: 'completed',
  subject: { reference: 'Patient/p1' }
})

describe('fetchLastPmsi (Part 1 — must not request _include)', () => {
  it('never sends _include on any Condition or Procedure request, and still returns the fetched resources', async () => {
    const conditions = [makeCondition('c1', true), makeCondition('c2', false)]
    const procedures = [makeProcedure('p1'), makeProcedure('p2')]

    fhirSearch.mockImplementation(async (resource: string, options: string[]) => {
      const isCountOnly = options.includes('_count=0')
      if (resource === 'Condition') {
        return {
          data: {
            resourceType: 'Bundle',
            total: conditions.length,
            entry: isCountOnly ? undefined : conditions.map((resource) => ({ resource }))
          }
        }
      }
      if (resource === 'Procedure') {
        return {
          data: {
            resourceType: 'Bundle',
            total: procedures.length,
            entry: isCountOnly ? undefined : procedures.map((resource) => ({ resource }))
          }
        }
      }
      return { data: { resourceType: 'Bundle', total: 0, entry: [] } }
    })

    const patient = makePatient('p1')
    const result = await fetchLastPmsi({ patient })

    const conditionCalls = callsFor('Condition')
    const procedureCalls = callsFor('Procedure')
    expect(conditionCalls.length).toBeGreaterThan(0)
    expect(procedureCalls.length).toBeGreaterThan(0)

    for (const call of [...conditionCalls, ...procedureCalls]) {
      expect(optionsOf(call)).not.toMatch(/_include=/)
    }

    // The produced PMSI result is unchanged by dropping `_include`: the main
    // resources still flow through to lastProcedure/mainDiagnosis/procedures/diagnostics.
    expect(result?.procedures?.map((p) => p.id)).toEqual(['p1', 'p2'])
    expect(result?.diagnostics?.map((c) => c.id)).toEqual(['c1', 'c2'])
    expect(result?.lastProcedure?.id).toBe('p1')
    expect(result?.mainDiagnosis?.map((c) => c.id)).toEqual(['c1'])
  })
})

describe('fetchConditionList / fetchProcedureList (Part 1 — default behavior for other callers)', () => {
  it('still requests _include by default (e.g. ExplorationBoard / cohort-level callers)', async () => {
    fhirSearch.mockResolvedValue({ data: { resourceType: 'Bundle', total: 0, entry: [] } } as never)

    await fetchConditionList(baseFetchParams, { filters: emptyFilters }, null, false, [])
    const conditionOptions = optionsOf(callsFor('Condition')[0])
    expect(conditionOptions).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(conditionOptions).toContain(`_include=${encodeURIComponent('Patient:subject')}`)

    await fetchProcedureList(baseFetchParams, { filters: emptyFilters }, null, false, [])
    const procedureOptions = optionsOf(callsFor('Procedure')[0])
    expect(procedureOptions).toContain(`_include=${encodeURIComponent('Encounter:encounter')}`)
    expect(procedureOptions).toContain(`_include=${encodeURIComponent('Patient:subject')}`)
  })

  it('omits _include when includeRelatedResources is explicitly false (fetchLastPmsi behavior)', async () => {
    fhirSearch.mockResolvedValue({ data: { resourceType: 'Bundle', total: 0, entry: [] } } as never)

    await fetchConditionList(baseFetchParams, { filters: emptyFilters }, null, false, [], undefined, false)
    expect(optionsOf(callsFor('Condition')[0])).not.toMatch(/_include=/)
  })
})

describe('fetchProcedureList / fetchConditionList (Part 2 — bounded pagination while _include is required)', () => {
  const patient = makePatient('p1')

  it('paginates in PMSI_INCLUDE_PAGE_SIZE chunks, still requests _include on every page, and combines all pages without truncation', async () => {
    const total = PMSI_INCLUDE_PAGE_SIZE * 2 + 3
    const allProcedures = Array.from({ length: total }, (_, i) => makeProcedure(`p${i}`))

    fhirSearch.mockImplementation(async (resource: string, options: string[]) => {
      if (resource !== 'Procedure') return { data: { resourceType: 'Bundle', total: 0, entry: [] } }
      const countOpt = options.find((o) => o.startsWith('_count='))
      const offsetOpt = options.find((o) => o.startsWith('_offset='))
      const count = Number(countOpt?.split('=')[1] ?? 0)
      const offset = Number(offsetOpt?.split('=')[1] ?? 0)
      return {
        data: {
          resourceType: 'Bundle',
          total,
          entry: allProcedures.slice(offset, offset + count).map((resource) => ({ resource }))
        }
      }
    })

    const result = await fetchProcedureList(
      { ...baseFetchParams, size: total },
      { filters: emptyFilters },
      patient,
      false,
      []
    )

    const procedureCalls = callsFor('Procedure')
    expect(procedureCalls).toHaveLength(3)

    const offsets = procedureCalls.map((call) => {
      const opt = (call[1] as string[]).find((o) => o.startsWith('_offset='))
      return Number(opt?.split('=')[1] ?? 0)
    })
    expect(offsets).toEqual([0, PMSI_INCLUDE_PAGE_SIZE, PMSI_INCLUDE_PAGE_SIZE * 2])

    // Every page must still carry `_include`: the shared pagination helper does not
    // change this caller's need for included Encounter/Patient resources.
    for (const call of procedureCalls) {
      expect(optionsOf(call)).toMatch(/_include=/)
    }

    // No silent truncation: all `total` resources, including the one only present
    // on the final page, come back in the combined, order-preserved result.
    expect(result.list.map((p) => p.id)).toEqual(allProcedures.map((p) => p.id))
  })
})
