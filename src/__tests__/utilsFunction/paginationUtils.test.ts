import { checkIfPageAvailable, handlePageError } from 'utils/paginationUtils'
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
