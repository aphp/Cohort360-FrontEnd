import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// usePagination gère la validation des numéros de page (garde métier):
// redirection page 1 si invalide, dialogue d'avertissement si > limite système
// ou > total disponible. On mocke le routeur, le store et la config.

const navigateMock = vi.fn()
const dispatchMock = vi.fn()
const showDialogMock = vi.fn((payload) => ({ type: 'warningDialog/showDialog', payload }))

const searchParamsState = vi.hoisted(() => ({ params: new URLSearchParams() }))

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [searchParamsState.params]
}))

vi.mock('state', () => ({
  useAppDispatch: () => dispatchMock
}))

vi.mock('state/warningDialog', () => ({
  showDialog: (payload: unknown) => showDialogMock(payload)
}))

vi.mock('config', () => ({
  getConfig: vi.fn(() => ({ core: { pagination: { limit: 100 } } }))
}))

vi.mock('components/ExplorationBoard/useData', () => ({
  RESULTS_PER_PAGE: 20
}))

import { usePagination } from 'components/ui/Pagination/usePagination'

beforeEach(() => {
  vi.clearAllMocks()
  searchParamsState.params = new URLSearchParams()
})

describe('usePagination - initialisation', () => {
  it('initialise currentPage à 1 sans paramètre d’URL', () => {
    const { result } = renderHook(() => usePagination())
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.total).toBe(0)
  })

  it('initialise currentPage depuis le paramètre d’URL', () => {
    searchParamsState.params = new URLSearchParams('page=3')
    const { result } = renderHook(() => usePagination())
    expect(result.current.pagination.currentPage).toBe(3)
  })
})

describe('usePagination - onChangeTotal', () => {
  it('convertit un nombre de résultats en nombre de pages', () => {
    const { result } = renderHook(() => usePagination())
    act(() => result.current.onChangeTotal(45))
    // 45 / 20 arrondi au supérieur = 3
    expect(result.current.pagination.total).toBe(3)
  })
})

describe('usePagination - onChangePage (garde de validation)', () => {
  it('ne valide pas le premier changement quand la page vient de l’URL', () => {
    searchParamsState.params = new URLSearchParams('page=2')
    const { result } = renderHook(() => usePagination())
    act(() => result.current.onChangePage(2))
    // premier appel: consomme le flag isPageFromUrl, pas de navigation
    expect(navigateMock).not.toHaveBeenCalled()
    expect(dispatchMock).not.toHaveBeenCalled()
  })

  it('met à jour la pagination et navigue pour une page valide', () => {
    const { result } = renderHook(() => usePagination())
    act(() => result.current.onChangePage(2))
    expect(result.current.pagination.currentPage).toBe(2)
    expect(navigateMock).toHaveBeenCalled()
    expect(dispatchMock).not.toHaveBeenCalled()
  })

  it('affiche un avertissement quand la page dépasse la limite système', () => {
    const { result } = renderHook(() => usePagination())
    act(() => result.current.onChangePage(150))
    expect(dispatchMock).toHaveBeenCalled()
    expect(showDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: true, status: 'warning' })
    )
  })

  it('affiche un avertissement quand la page dépasse le total disponible', () => {
    const { result } = renderHook(() => usePagination())
    act(() => result.current.onChangeTotal(40)) // total = 2 pages
    act(() => result.current.onChangePage(5))
    expect(showDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: true, status: 'warning' })
    )
  })
})
