import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { Direction, Order, SearchCriterias } from 'types/searchCriterias'

type TestFilters = { status: string[] }

const initState: SearchCriterias<TestFilters> = {
  orderBy: { orderBy: Order.ID, orderDirection: Direction.DESC },
  searchInput: '',
  filters: { status: [] }
}

describe('useSearchCriterias - comportement du resetKey', () => {
  it("ne devrait pas réinitialiser l'état au montage initial", () => {
    const { result } = renderHook(() => useSearchCriterias(initState, 'key-initial'))

    const [state] = result.current
    expect(state).toEqual(initState)
  })

  it("devrait réinitialiser l'état quand resetKey change", () => {
    let resetKey = 'key-1'
    const { result, rerender } = renderHook(() => useSearchCriterias(initState, resetKey))

    // Modifier l'état via une action
    act(() => {
      const [, actions] = result.current
      actions.changeSearchInput('test')
    })

    expect(result.current[0].searchInput).toBe('test')

    // Changer le resetKey → doit déclencher REMOVE_SEARCH_CRITERIAS
    resetKey = 'key-2'
    rerender()

    expect(result.current[0].searchInput).toBe('')
    expect(result.current[0]).toEqual(initState)
  })

  it("ne devrait pas réinitialiser l'état si resetKey ne change pas", () => {
    const { result, rerender } = renderHook(() => useSearchCriterias(initState, 'key-stable'))

    act(() => {
      const [, actions] = result.current
      actions.changeSearchInput('valeur persistée')
    })

    expect(result.current[0].searchInput).toBe('valeur persistée')

    // Re-render sans changer resetKey
    rerender()

    // L'état ne doit pas avoir été réinitialisé
    expect(result.current[0].searchInput).toBe('valeur persistée')
  })

  it("devrait réinitialiser l'état à chaque changement successif de resetKey", () => {
    let resetKey = 'key-a'
    const { result, rerender } = renderHook(() => useSearchCriterias(initState, resetKey))

    act(() => {
      result.current[1].changeSearchInput('premier')
    })
    expect(result.current[0].searchInput).toBe('premier')

    resetKey = 'key-b'
    rerender()
    expect(result.current[0].searchInput).toBe('')

    act(() => {
      result.current[1].changeSearchInput('deuxième')
    })
    expect(result.current[0].searchInput).toBe('deuxième')

    resetKey = 'key-c'
    rerender()
    expect(result.current[0].searchInput).toBe('')
    expect(result.current[0]).toEqual(initState)
  })
})
