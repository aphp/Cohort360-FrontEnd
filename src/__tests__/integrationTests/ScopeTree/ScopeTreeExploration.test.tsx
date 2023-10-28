import { Reducer, configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'
import { describe, test, vi } from 'vitest'
import ScopeTreeExploration from '../../../components/ScopeTree/ScopeTreeExploration'
import scope from '../../../state/scope'
import { ScopeTreeRow, ScopeType } from '../../../types'

describe('ScopeTreeExploration', () => {
  test('renders table for scope tree exploration with header and given data', () => {
    const rootRows: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Item 1',
        quantity: 1,
        subItems: []
      },
      {
        id: '2',
        name: 'Item 2',
        quantity: 2,
        subItems: []
      }
    ]
    const initialState = {
      scope: {
        scopesList: rootRows
      }
    }
    const rootReducer: Reducer = combineReducers({ scope })
    const mockStore = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: [thunk]
    })
    const selectedItems: ScopeTreeRow[] = []
    const setSelectedItems = vi.fn()
    const searchSavedRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType | undefined = undefined
    const isSelectionLoading = false
    const openPopulation: number[] = []
    const setOpenPopulations = vi.fn()
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeExploration
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          openPopulation={openPopulation}
          setOpenPopulations={setOpenPopulations}
          setSearchSavedRootRows={setSearchSavedRootRows}
        />
      </Provider>
    )
    expect(container).toBeInTheDocument()
    const xpaths = [
      '//span[normalize-space()="Nom"]',
      '//span[normalize-space()="Nombre de patients"]',
      '//span[normalize-space()="Accès"]',
      '//p[normalize-space()="Item 1"]',
      '//p[normalize-space()="Item 2"]'
    ]
    xpaths.forEach((xpath) => {
      const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      const span = result.singleNodeValue
      expect(span).to.exist
    })
  })

  test('renders table for scope tree exploration of an executive units', () => {
    const rootRows: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Item 1',
        quantity: 1,
        subItems: []
      },
      {
        id: '2',
        name: 'Item 2',
        quantity: 2,
        subItems: []
      }
    ]
    const initialState = {
      scope: {
        scopesList: rootRows
      }
    }
    const rootReducer: Reducer = combineReducers({ scope })
    const mockStore = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: [thunk]
    })
    const selectedItems: ScopeTreeRow[] = []
    const setSelectedItems = vi.fn()
    const searchSavedRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType | undefined = 'AP-HP'
    const isSelectionLoading = false
    const openPopulation: number[] = []
    const setOpenPopulations = vi.fn()
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeExploration
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          openPopulation={openPopulation}
          setOpenPopulations={setOpenPopulations}
          setSearchSavedRootRows={setSearchSavedRootRows}
        />
      </Provider>
    )
    expect(container).toBeInTheDocument()
    const xpaths = [
      '//span[normalize-space()="Nom"]',
      '//span[normalize-space()="Nombre de patients"]',
      '//span[normalize-space()="Type"]'
    ]
    xpaths.forEach((xpath) => {
      const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      const span = result.singleNodeValue
      expect(span).to.exist
    })
  })

  test('displays a linear progress loading when isSelectionLoading is true', () => {
    const rootRows: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Item 1',
        quantity: 1,
        subItems: []
      },
      {
        id: '2',
        name: 'Item 2',
        quantity: 2,
        subItems: []
      }
    ]
    const initialState = {
      scope: {
        scopesList: rootRows
      }
    }
    const rootReducer: Reducer = combineReducers({ scope })
    const mockStore = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: [thunk]
    })
    const selectedItems: ScopeTreeRow[] = []
    const setSelectedItems = vi.fn()
    const searchSavedRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType = 'AP-HP'
    const isSelectionLoading = true
    const openPopulation: number[] = []
    const setOpenPopulations = vi.fn()
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeExploration
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          openPopulation={openPopulation}
          setOpenPopulations={setOpenPopulations}
          setSearchSavedRootRows={setSearchSavedRootRows}
        />
      </Provider>
    )
    const linearProgress = document.querySelector('.MuiLinearProgress-root')
    expect(linearProgress).to.exist
  })
})
