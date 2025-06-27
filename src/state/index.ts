/**
 * @fileoverview Redux state management index file.
 * Exports typed Redux hooks and state types for the application.
 */

import { store } from 'state/store'
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux'

/**
 * Root state type inferred from the store's getState return type.
 * This type represents the complete application state structure.
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * Typed version of the useSelector hook for use throughout the application.
 * Provides type safety when selecting state from the Redux store.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Type representing the dispatch function with all action types.
 * Used for typing dispatch calls in components.
 */
export type AppDispatch = typeof store.dispatch

/**
 * Typed version of the useDispatch hook for use throughout the application.
 * Provides type safety when dispatching actions to the Redux store.
 *
 * @returns {AppDispatch} Typed dispatch function
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
