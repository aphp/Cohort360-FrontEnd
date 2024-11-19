import { checkIfPageAvailable, cleanSearchParams, getCleanGroupId, handlePageError } from 'utils/paginationUtils'
import { vi } from 'vitest'

describe('checkIfPageAvailable', () => {
  it('should not return a dispatch with error ', () => {
    const count = 0
    const currentPage = 1
    const setPage = vi.fn()
    const dispatch = vi.fn()
    const rowsPerPage = 20

    checkIfPageAvailable(count, currentPage, setPage, dispatch, rowsPerPage)
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('should return dispatch with error', () => {
    const count = 300
    const currentPage = 155
    const setPage = vi.fn()
    const dispatch = vi.fn()
    const rowsPerPage = 20

    checkIfPageAvailable(count, currentPage, setPage, dispatch, rowsPerPage)
    expect(dispatch).toHaveBeenCalled()
  })
})

describe('handlePageError', () => {
  it('should not return a dispatch with error ', () => {
    const page = 1
    const setPage = vi.fn()
    const dispatch = vi.fn()
    const setLoadingStatus = vi.fn()

    handlePageError(page, setPage, dispatch, setLoadingStatus)
    expect(dispatch).not.toHaveBeenCalled()
    expect(setLoadingStatus).toHaveBeenCalled()
  })
  it('should return dispatch with error', () => {
    const page = 1001
    const setPage = vi.fn()
    const dispatch = vi.fn()
    const setLoadingStatus = vi.fn()

    handlePageError(page, setPage, dispatch, setLoadingStatus)
    expect(dispatch).toHaveBeenCalled()
  })
})

describe('test of getCleanGroupId function', () => {
  it('should return no groupId if perimeter is empty or null', () => {
    const groupId = ''
    expect(getCleanGroupId(groupId)).toBeUndefined()

    const groupId2 = null
    expect(getCleanGroupId(groupId2)).toBeUndefined()
  })
  it('should return no groupId if perimeter ids make no sense', () => {
    const groupId = ',,,,'
    expect(getCleanGroupId(groupId)).toBeUndefined()

    const groupId2 = ';;;;'
    expect(getCleanGroupId(groupId2)).toBeUndefined()

    const groupId3 = '-,--'
    expect(getCleanGroupId(groupId3)).toBeUndefined()
  })
  it('should only return numbers separated by commas if groupId is a mess', () => {
    const groupId = '12345,,nimp,;,8zhbea,,'
    expect(getCleanGroupId(groupId)).toBe('12345')
  })
  it('should return the right ids separated by commas', () => {
    const groupId = '123,456'
    expect(getCleanGroupId(groupId)).toBe('123,456')
  })
  it('should not return commas that are at the beginning or at the end', () => {
    const groupId = ',123,456,'
    expect(getCleanGroupId(groupId)).toBe('123,456')
  })
})

describe('test of cleanSearchParams function', () => {
  it('should return the right url params', () => {
    const page = '3'
    const tabId = 'MedicationRequest'
    const groupId = '123456'

    expect(cleanSearchParams({ page, tabId, groupId })).toStrictEqual({
      groupId: '123456',
      page: '3',
      tabId: 'MedicationRequest'
    })
  })
  it('should not return groupId in the params if groupId makes no sense or is undefined', () => {
    const page = '1'
    const groupId2 = 'rijfn236e53:;a'
    const groupId3 = ',,,'

    expect(cleanSearchParams({ page })).toStrictEqual({ page: '1' })
    expect(cleanSearchParams({ page, groupId: groupId2 })).toStrictEqual({ page: '1' })
    expect(cleanSearchParams({ page, groupId: groupId3 })).toStrictEqual({ page: '1' })
  })
  it('should not return tabId in the params if tabId is undefined', () => {
    const page = '1'

    expect(cleanSearchParams({ page })).toStrictEqual({ page: '1' })
  })
})
