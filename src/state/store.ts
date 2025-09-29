/**
 * @fileoverview Redux store configuration with persistence and middleware setup.
 * Configures the main application store with persistence, logging, and state synchronization.
 */

import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync'
import { combineReducers } from 'redux'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import thunkMiddleware from 'redux-thunk'
import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'

import localforage from 'localforage'

import cohortCreation from './cohortCreation'
import exploredCohort from './exploredCohort'
import autoLogout from './autoLogout'
import criteria from './criteria'
import message from './message'
import patient from './patient'
import project from './project'
import request from './request'
import drawer from './drawer'
import scope from './scope'
import me from './me'
import warningDialog from './warningDialog'
import valueSets from './valueSets'
import preferences from './preferences'

/**
 * Combined reducer for cohort creation functionality.
 * Merges criteria and request reducers under cohortCreation namespace.
 */
const cohortCreationReducer = combineReducers({
  criteria,
  request: cohortCreation
})

/**
 * Root reducer combining all application state slices.
 * Defines the complete application state structure.
 */
const rootReducer = combineReducers({
  me,
  preferences,
  cohortCreation: cohortCreationReducer,
  valueSets,
  exploredCohort,
  drawer,
  message,
  project,
  request,
  scope,
  patient,
  autoLogout,
  warningDialog
})

/**
 * Redux persist configuration.
 * Uses localforage for persistent storage with 'root' key.
 */
const persistConfig = {
  key: 'root',
  storage: localforage,
  blacklist: ['message', 'warningDialog']
}

/**
 * Persisted version of the root reducer.
 * Enables automatic state persistence and rehydration.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer)

/**
 * Main Redux store configuration.
 *
 * Features:
 * - State persistence with redux-persist
 * - Cross-tab state synchronization
 * - Redux thunk for async actions
 * - Development logging with redux-logger
 * - Custom serialization handling for dialogs
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'warningDialog/showDialog',
          'warningDialog/onConfirm'
        ],
        ignoredPaths: ['warningDialog.showDialog', 'warningDialog.onConfirm']
      }
    })
      .prepend(
        thunkMiddleware,
        createStateSyncMiddleware({
          predicate: (action) => action.type == 'autoLogout/open' || action.type == 'autoLogout/close'
        })
      )
      // @ts-ignore
      .concat(logger)
})

/**
 * Initialize state synchronization with previous tab.
 * Ensures consistent state across multiple browser tabs.
 */
initStateWithPrevTab(store)

/**
 * Redux persist store for managing persistence lifecycle.
 * Used to control when persistence starts/stops.
 */
export const persistor = persistStore(store)
