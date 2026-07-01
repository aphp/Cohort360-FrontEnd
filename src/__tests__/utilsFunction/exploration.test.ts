import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Condition, Encounter, Patient } from 'fhir/r4'
import { Direction, Order, PMSIFilters } from 'types/searchCriterias'
import { FetchOptions, FetchParams, Patient as PatientType } from 'types/exploration'

vi.mock('services/aphp/serviceValueSets', () => ({
  getCodeList: vi.fn()
}))

vi.mock('utils/fillElement', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/fillElement')>()
  return {
    ...actual,
    getResourceInfos: vi.fn(),
    getResourceInfosFromBundle: vi.fn()
  }
})

vi.mock('utils/encounter', () => ({
  linkElementWithEncounter: vi.fn()
}))

import { fetcherWithParams } from 'utils/exploration'
import { getResourceInfos, getResourceInfosFromBundle } from 'utils/fillElement'
import { linkElementWithEncounter } from 'utils/encounter'

const mockGetResourceInfos = vi.mocked(getResourceInfos)
const mockGetResourceInfosFromBundle = vi.mocked(getResourceInfosFromBundle)
const mockLinkElementWithEncounter = vi.mocked(linkElementWithEncounter)

const makeCondition = (id: string): Condition => ({
  resourceType: 'Condition',
  id,
  subject: { reference: 'Patient/p1' },
  encounter: { reference: 'Encounter/e1' }
})

const makePatient = (id: string): Patient => ({ resourceType: 'Patient', id })
const makeEncounter = (id: string): Encounter => ({
  resourceType: 'Encounter',
  id,
  status: 'finished',
  class: {}
})

const makeBundle = (resources: object[], total = resources.length) =>
  ({
    data: {
      resourceType: 'Bundle',
      total,
      meta: {},
      entry: resources.map((resource) => ({ resource }))
    }
  }) as never

const baseParams: FetchParams &
  FetchOptions<PMSIFilters> & {
    deidentified: boolean
    patient: PatientType | null
    groupId?: string[]
    isPatientData?: boolean
  } = {
  page: 1,
  size: 20,
  includeFacets: false,
  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
  searchInput: '',
  filters: {} as PMSIFilters,
  groupId: ['g1'],
  deidentified: false,
  patient: null
}

describe('fetcherWithParams _include handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetResourceInfos.mockResolvedValue([])
    mockGetResourceInfosFromBundle.mockResolvedValue([])
    mockLinkElementWithEncounter.mockResolvedValue([])
  })

  it('uses included Patient/Encounter from the bundle (no extra fetch) when not in patient context', async () => {
    const condition = makeCondition('c1')
    const patient = makePatient('p1')
    const encounter = makeEncounter('e1')
    const list = makeBundle([condition, patient, encounter])

    await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([])),
      { ...baseParams, deidentified: false, patient: null }
    )

    expect(mockGetResourceInfosFromBundle).toHaveBeenCalledTimes(1)
    expect(mockGetResourceInfos).not.toHaveBeenCalled()

    const [mainResources, deid, patients, encounters] = mockGetResourceInfosFromBundle.mock.calls[0]
    expect(mainResources).toEqual([condition])
    expect(deid).toBe(false)
    expect(patients).toEqual([patient])
    expect(encounters).toEqual([encounter])
  })

  it('falls back to getResourceInfos when the bundle has no included resources', async () => {
    const condition = makeCondition('c1')
    const list = makeBundle([condition])

    await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([])),
      { ...baseParams, deidentified: false, patient: null }
    )

    expect(mockGetResourceInfos).toHaveBeenCalledTimes(1)
    expect(mockGetResourceInfosFromBundle).not.toHaveBeenCalled()
    expect(mockGetResourceInfos.mock.calls[0][0]).toEqual([condition])
  })

  it('uses getResourceInfosFromBundle in deidentified mode even without included patients', async () => {
    const condition = makeCondition('c1')
    const encounter = makeEncounter('e1')
    const list = makeBundle([condition, encounter])

    await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([])),
      { ...baseParams, deidentified: true, patient: null }
    )

    expect(mockGetResourceInfosFromBundle).toHaveBeenCalledTimes(1)
    expect(mockGetResourceInfos).not.toHaveBeenCalled()
    const [mainResources, deid, patients, encounters] = mockGetResourceInfosFromBundle.mock.calls[0]
    expect(mainResources).toEqual([condition])
    expect(deid).toBe(true)
    expect(patients).toEqual([])
    expect(encounters).toEqual([encounter])
  })

  it('uses linkElementWithEncounter in patient context and ignores included resources', async () => {
    const condition = makeCondition('c1')
    const patient = makePatient('p1')
    const encounter = makeEncounter('e1')
    const list = makeBundle([condition, patient, encounter])

    await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([])),
      { ...baseParams, deidentified: false, patient: { infos: { hospits: [] } } as unknown as PatientType }
    )

    expect(mockLinkElementWithEncounter).toHaveBeenCalledTimes(1)
    expect(mockGetResourceInfosFromBundle).not.toHaveBeenCalled()
    expect(mockGetResourceInfos).not.toHaveBeenCalled()

    expect(mockLinkElementWithEncounter.mock.calls[0][0]).toEqual([condition])
  })

  it('does not leak included Patient/Encounter into results.total', async () => {
    const condition = makeCondition('c1')
    const patient = makePatient('p1')
    const encounter = makeEncounter('e1')

    const list = makeBundle([condition, patient, encounter], 1)

    const result = await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([], 42)),
      { ...baseParams, deidentified: false, patient: null }
    )

    expect(result.total).toBe(1)
  })

  it('returns the raw bundle for patient-data lists without enrichment', async () => {
    const patient = makePatient('p1')
    const list = makeBundle([patient])

    const result = await fetcherWithParams(
      () => Promise.resolve(list),
      () => Promise.resolve(makeBundle([])),
      { ...baseParams, deidentified: false, patient: null, isPatientData: true }
    )

    expect(mockGetResourceInfos).not.toHaveBeenCalled()
    expect(mockGetResourceInfosFromBundle).not.toHaveBeenCalled()
    expect(mockLinkElementWithEncounter).not.toHaveBeenCalled()
    expect(result.list).toEqual([patient])
  })
})
