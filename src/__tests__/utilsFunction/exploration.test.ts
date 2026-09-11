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

import { fetcherWithParams, fetchInPages } from 'utils/exploration'
import { getResourceInfos, getResourceInfosFromBundle } from 'utils/fillElement'
import { linkElementWithEncounter } from 'utils/encounter'
import { PMSI_INCLUDE_PAGE_SIZE } from 'types/exploration'

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

describe('fetchInPages', () => {
  const makePagedBundle = (ids: string[], total: number) => makeBundle(ids.map(makeCondition), total)

  it('issues a single request when the requested size already fits in one page', async () => {
    const fetchPage = vi.fn().mockResolvedValue(makePagedBundle(['c0'], 1))

    const result = await fetchInPages(fetchPage, PMSI_INCLUDE_PAGE_SIZE, 0)

    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(PMSI_INCLUDE_PAGE_SIZE, 0)
    expect((result.data as { total: number }).total).toBe(1)
  })

  it('paginates in bounded pages, preserving order, when size exceeds one page', async () => {
    const total = PMSI_INCLUDE_PAGE_SIZE * 2 + 5
    const allIds = Array.from({ length: total }, (_, i) => `c${i}`)

    const fetchPage = vi.fn(async (size: number, offset: number) =>
      makePagedBundle(allIds.slice(offset, offset + size), total)
    )

    const result = await fetchInPages(fetchPage, total, 0)

    expect(fetchPage).toHaveBeenCalledTimes(3)
    expect(fetchPage).toHaveBeenNthCalledWith(1, PMSI_INCLUDE_PAGE_SIZE, 0)
    expect(fetchPage).toHaveBeenNthCalledWith(2, PMSI_INCLUDE_PAGE_SIZE, PMSI_INCLUDE_PAGE_SIZE)
    expect(fetchPage).toHaveBeenNthCalledWith(3, 5, PMSI_INCLUDE_PAGE_SIZE * 2)

    const entryIds = (result.data as { entry: { resource: { id: string } }[] }).entry.map((e) => e.resource.id)
    expect(entryIds).toEqual(allIds)
  })

  it('does not silently truncate a resource that only exists on the final page', async () => {
    const total = PMSI_INCLUDE_PAGE_SIZE + 3
    const allIds = Array.from({ length: total }, (_, i) => `c${i}`)
    const lastPageOnlyId = allIds[allIds.length - 1]

    const fetchPage = vi.fn(async (size: number, offset: number) =>
      makePagedBundle(allIds.slice(offset, offset + size), total)
    )

    const result = await fetchInPages(fetchPage, total, 0)

    const entryIds = (result.data as { entry: { resource: { id: string } }[] }).entry.map((e) => e.resource.id)
    expect(entryIds).toContain(lastPageOnlyId)
    expect(entryIds).toHaveLength(total)
  })

  it('stops once the reported total is reached, even if smaller than the requested size', async () => {
    const realTotal = PMSI_INCLUDE_PAGE_SIZE + 5
    const requestedSize = PMSI_INCLUDE_PAGE_SIZE * 3
    const allIds = Array.from({ length: realTotal }, (_, i) => `c${i}`)

    const fetchPage = vi.fn(async (size: number, offset: number) =>
      makePagedBundle(allIds.slice(offset, offset + size), realTotal)
    )

    const result = await fetchInPages(fetchPage, requestedSize, 0)

    // Only the two pages that actually contain data should be requested,
    // never a third page beyond the server-reported total.
    expect(fetchPage).toHaveBeenCalledTimes(2)
    const entryIds = (result.data as { entry: { resource: { id: string } }[] }).entry.map((e) => e.resource.id)
    expect(entryIds).toEqual(allIds)
  })

  it('preserves the upstream sort order across combined pages without client-side reordering', async () => {
    // Entries are handed back in whatever order fetchPage returns them (i.e. the
    // server's `_sort`); fetchInPages must not reorder them itself.
    const total = PMSI_INCLUDE_PAGE_SIZE + 2
    const descendingIds = Array.from({ length: total }, (_, i) => `c${total - i}`)

    const fetchPage = vi.fn(async (size: number, offset: number) =>
      makePagedBundle(descendingIds.slice(offset, offset + size), total)
    )

    const result = await fetchInPages(fetchPage, total, 0)

    const entryIds = (result.data as { entry: { resource: { id: string } }[] }).entry.map((e) => e.resource.id)
    expect(entryIds).toEqual(descendingIds)
  })

  it('propagates a non-Bundle response (e.g. OperationOutcome) without retrying further pages', async () => {
    const operationOutcome = { data: { resourceType: 'OperationOutcome', issue: [] } } as never
    const fetchPage = vi.fn().mockResolvedValueOnce(operationOutcome)

    const result = await fetchInPages(fetchPage, PMSI_INCLUDE_PAGE_SIZE * 2 + 1, 0)

    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(result).toBe(operationOutcome)
  })
})
