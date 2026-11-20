import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Direction, Order } from 'types/searchCriterias'

vi.mock('services/aphp/callApi', () => ({ fetchObservation: vi.fn() }))
vi.mock('utils/exploration', () => ({
  fetcherWithParams: vi.fn(),
  getCommonParamsAll: vi.fn(() => ({ size: 0 })),
  getCommonParamsList: vi.fn(() => ({ size: 10, offset: 0 })),
  narrowSearchCriterias: vi.fn((_, criterias) => criterias)
}))

import { biologyConfig } from 'components/ExplorationBoard/config/biology'
import { fetchObservation } from 'services/aphp/callApi'
import { fetcherWithParams } from 'utils/exploration'

const mockFetcherWithParams = vi.mocked(fetcherWithParams)
const mockFetchObservation = vi.mocked(fetchObservation)

const fetchParams = {
  size: 10,
  page: 1,
  searchInput: '',
  orderBy: { orderBy: Order.ISSUED, orderDirection: Direction.DESC },
  includeFacets: false
}

// Exécute fetchList puis la fonction "liste" passée à fetcherWithParams
const runListFetch = async (validationDateRange: [string | null, string | null]) => {
  mockFetcherWithParams.mockResolvedValue({ list: [] } as never)
  await biologyConfig(false, null, ['g1']).fetchList!(fetchParams, {
    filters: { code: [], validatedStatus: true, ipp: '', durationRange: [null, null], validationDateRange }
  })
  const listFetcher = mockFetcherWithParams.mock.calls[0][0] as () => unknown
  listFetcher()
  return mockFetchObservation.mock.calls[0][0]
}

describe('biology config - fetchList (BC3.3 #3283)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('transmet les bornes de Date de validation à fetchObservation', async () => {
    const params = await runListFetch(['2024-02-01', '2024-02-29'])
    expect(params).toMatchObject({ minValidationDate: '2024-02-01', maxValidationDate: '2024-02-29' })
  })

  it('envoie des bornes vides quand la Date de validation n’est pas renseignée', async () => {
    const params = await runListFetch([null, null])
    expect(params).toMatchObject({ minValidationDate: '', maxValidationDate: '' })
  })
})
