import { AppDispatch } from 'state'
import { cleanSearchParams, getCleanGroupId } from 'utils/paginationUtils'
import { validatePageNumber } from 'utils/url'
import { vi } from 'vitest'

describe('validatePageNumber', () => {
  it('should not return a dispatch with error ', () => {
    const totalPages = Math.ceil(0 / 20)
    const currentPage = 1
    const setPage = vi.fn()
    const dispatch = vi.fn()

    validatePageNumber(totalPages, currentPage, setPage, dispatch as unknown as AppDispatch)
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('should return dispatch with error', () => {
    const totalPages = Math.ceil(300 / 20)
    const currentPage = 155
    const setPage = vi.fn()
    const dispatch = vi.fn()

    validatePageNumber(currentPage, totalPages, setPage, dispatch as unknown as AppDispatch)
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
