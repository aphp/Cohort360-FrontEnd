import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { mapRequestParamsToSearchCriteria } from 'mappers/filters'
import { getFiltersService } from 'services/aphp/serviceFilters'
import { ResourceType } from 'types/requestCriterias'
import { SavedFilter } from 'types/searchCriterias'

vi.mock('services/aphp/serviceFilters', () => ({
  getFiltersService: vi.fn(),
  postFiltersService: vi.fn(),
  deleteFiltersService: vi.fn(),
  deleteFilterService: vi.fn(),
  patchFiltersService: vi.fn()
}))

vi.mock('mappers/filters', () => ({
  mapRequestParamsToSearchCriteria: vi.fn()
}))

const mockGetFilters = vi.mocked(getFiltersService)
const mockMapper = vi.mocked(mapRequestParamsToSearchCriteria)

const savedFilter = (overrides: Partial<SavedFilter> = {}) =>
  ({ uuid: 'u1', name: 'Mes CR', filter: 'type=abc', ...overrides }) as SavedFilter

beforeEach(() => {
  vi.clearAllMocks()
  mockGetFilters.mockResolvedValue({ count: 0, next: null, previous: null, results: [] } as never)
  mockMapper.mockResolvedValue({ filters: {} } as never)
})

describe('useSavedFilters.mapToSelectedFilter', () => {
  it.each([true, false])('transmet only_pdf_available=%s au mapper', async (value) => {
    const { result } = renderHook(() => useSavedFilters(ResourceType.DOCUMENTS))
    await waitFor(() => expect(mockGetFilters).toHaveBeenCalled())

    await result.current.methods.mapToSelectedFilter(savedFilter({ only_pdf_available: value }))

    expect(mockMapper).toHaveBeenCalledWith('type=abc', ResourceType.DOCUMENTS, value)
  })

  it('laisse le mapper appliquer sa valeur par défaut quand le champ est absent (anciens backends)', async () => {
    const { result } = renderHook(() => useSavedFilters(ResourceType.DOCUMENTS))
    await waitFor(() => expect(mockGetFilters).toHaveBeenCalled())

    const selected = await result.current.methods.mapToSelectedFilter(savedFilter())

    expect(mockMapper).toHaveBeenCalledWith('type=abc', ResourceType.DOCUMENTS, undefined)
    expect(selected).toEqual({ filterUuid: 'u1', filterName: 'Mes CR', filterParams: { filters: {} } })
  })
})
