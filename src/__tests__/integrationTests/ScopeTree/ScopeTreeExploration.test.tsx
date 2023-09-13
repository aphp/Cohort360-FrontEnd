import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { describe, test, vi } from 'vitest'
import ScopeTreeExploration from '../../../components/ScopeTree/ScopeTreeExploration'
import { ScopeTreeRow, ScopeType } from '../../../types'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { configureStore, Reducer } from '@reduxjs/toolkit'
import scope from '../../../state/scope'
import { combineReducers } from 'redux'
import localforage from 'localforage'
import { persistReducer } from 'redux-persist'

describe('Index', () => {
  test('renders without errors', () => {
    const selectedItems: ScopeTreeRow[] = []
    const setSelectedItems = vi.fn()
    const searchRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType = 'AP-HP'
    const isSelectionLoading = false
    const openPopulation: number[] = []
    const setOpenPopulations = vi.fn()
    const setIsSelectionLoading = vi.fn()
    const setSearchRootRows = vi.fn()

    const initialState = {
      scope: {
        scopesList: []
      }
    }
    const rootReducer: Reducer = combineReducers({ scope })
    const persistConfig = {
      key: 'root',
      storage: localforage
    }
    const persistedReducer: Reducer = persistReducer(persistConfig, rootReducer)

    const mockStore = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: [thunk]
    })

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeExploration
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchRootRows={searchRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          openPopulation={openPopulation}
          setOpenPopulations={setOpenPopulations}
          setSearchRootRows={setSearchRootRows}
        />
      </Provider>
    )
    expect(container).toBeInTheDocument()
  })
})
