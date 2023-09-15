import React from 'react'
import { getByText, render, waitForElementToBeRemoved } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { describe, test, vi } from 'vitest'
import { ScopeTreeRow, ScopeType } from '../../../types'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { configureStore, Reducer } from '@reduxjs/toolkit'
import scope from '../../../state/scope'
import { combineReducers } from 'redux'
import ScopeTreeSearch from '../../../components/ScopeTree/ScopeTreeSearch'
import servicesPerimeters from '../../../services/aphp/servicePerimeters'

describe('ScopeTreeSearch.test.tsx', () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.mock('../../../services/aphp/servicePerimeters', () => {
    return {
      default: {
        getPerimeters: vi.fn(),
        buildScopeTreeRowList: vi.fn(),
        findScope: vi.fn()
      }
    }
  })

  test('renders table for scope tree search with header', () => {
    const initialState = {
      scope: {
        scopesList: []
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
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()
    const searchInput = ''

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeSearch
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          setSearchSavedRootRows={setSearchSavedRootRows}
          searchInput={searchInput}
        />
      </Provider>
    )
    expect(container).toBeInTheDocument()

    const xpaths = [
      '//span[normalize-space()="Nom"]',
      '//span[normalize-space()="Nombre de patients"]',
      '//span[normalize-space()="Accès"]'
    ]
    xpaths.forEach((xpath) => {
      const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      const span = result.singleNodeValue
      expect(span).to.exist
    })
  })

  test('given an input text to search, when some scopes are found, then renders table for scope tree search', async () => {
    const rootRows: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Hopitalx1',
        quantity: 1,
        full_path: 'aphp/hopital1.1/hopital1.2/hopital1.3/Hopitalx1',
        type: 'Unité Fonctionnelle (UF)',
        subItems: []
      },
      {
        id: '2',
        name: 'Hopitalx2',
        quantity: 2,
        full_path: 'aphp/hopital2.1/hopital2.2/hopital2.3/Hopitalx2',
        type: 'Unité Fonctionnelle (UF)',
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
    let searchSavedRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType | undefined = undefined
    const isSelectionLoading = false
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()
    vi.mocked(servicesPerimeters.findScope).mockResolvedValue({
      scopeTreeRows: rootRows,
      count: 2,
      aborted: false
    })
    const searchInput = 'Hopitalx'

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeSearch
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          setSearchSavedRootRows={setSearchSavedRootRows}
          searchInput={searchInput}
        />
      </Provider>
    )
    await waitForElementToBeRemoved(() => document.querySelector('.MuiCircularProgress-root'))
    expect(container).toBeInTheDocument()

    const xpaths = [
      '//span[normalize-space()="Nom"]',
      '//span[normalize-space()="Nombre de patients"]',
      '//span[normalize-space()="Accès"]',
      '//p[normalize-space()="Hopitalx1"]',
      '//p[normalize-space()="Hopitalx2"]'
    ]
    xpaths.forEach((xpath) => {
      const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      const span = result.singleNodeValue
      expect(span).to.exist
    })
  })

  test('given an input text to search, when no scopes are found , then renders table for scope tree search', async () => {
    const initialState = {
      scope: {
        scopesList: []
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
    let searchSavedRootRows: ScopeTreeRow[] = []
    const executiveUnitType: ScopeType | undefined = undefined
    const isSelectionLoading = false
    const setIsSelectionLoading = vi.fn()
    const setSearchSavedRootRows = vi.fn()
    vi.mocked(servicesPerimeters.findScope).mockResolvedValue({
      scopeTreeRows: [],
      count: 2,
      aborted: false
    })
    const searchInput = 'Hopitalx'

    const { container } = render(
      <Provider store={mockStore}>
        <ScopeTreeSearch
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchSavedRootRows={searchSavedRootRows}
          executiveUnitType={executiveUnitType}
          isSelectionLoading={isSelectionLoading}
          setIsSelectionLoading={setIsSelectionLoading}
          setSearchSavedRootRows={setSearchSavedRootRows}
          searchInput={searchInput}
        />
      </Provider>
    )
    await waitForElementToBeRemoved(() => document.querySelector('.MuiCircularProgress-root'))
    expect(container).toBeInTheDocument()

    const xpaths = [
      '//span[normalize-space()="Nom"]',
      '//span[normalize-space()="Nombre de patients"]',
      '//span[normalize-space()="Accès"]'
    ]
    xpaths.forEach((xpath) => {
      const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      const span = result.singleNodeValue
      expect(span).to.exist
    })
    const noResultsText = getByText(container, 'Aucun résultat à afficher')
    expect(noResultsText).toBeInTheDocument()
  })
})
