import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync'
import localforage from 'localforage'

import { createLogger } from 'redux-logger'

// Import reducers
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
import { temporalConstraintsMiddleware } from './middlewares'

// Combine reducers
export const rootReducer = combineReducers({
  me,
  preferences,
  cohortCreation: combineReducers({
    criteria,
    request: cohortCreation
  }),
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

// Persist configuration
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

// Redux-state-sync middleware
const stateSyncMiddleware = createStateSyncMiddleware({
  predicate: (action) => action.type === 'autoLogout/open' || action.type === 'autoLogout/close'
})

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
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
    }).concat(temporalConstraintsMiddleware)

    // Add custom middleware
    middleware.prepend(stateSyncMiddleware)

    // Add logger in development
    if (process.env.NODE_ENV === 'development') {
      const logger = createLogger({
        predicate: (getState, action) => {
          // Filter out noisy actions
          const ignoredActions = [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/FLUSH',
            'persist/PAUSE',
            'persist/PURGE',
            'persist/REGISTER'
          ]
          return !ignoredActions.includes(action.type)
        },
        collapsed: false,
        duration: true,
        timestamp: true,
        level: 'log'
      })
      return middleware.concat(logger)
    }

    return middleware
  },
  devTools: true
})

// Initialize state sync
initStateWithPrevTab(store)

// Create persistor
export const persistor = persistStore(store)

// Infer types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
