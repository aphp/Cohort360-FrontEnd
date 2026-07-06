import { combineReducers, configureStore } from '@reduxjs/toolkit'
import localforage from 'localforage'
import { createLogger } from 'redux-logger'
import { FLUSH, PAUSE, PERSIST, PURGE, persistReducer, persistStore, REGISTER, REHYDRATE } from 'redux-persist'
import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync'
import autoLogout from './autoLogout'
// Import reducers
import cohortCreation from './cohortCreation'
import criteria from './criteria'
import drawer from './drawer'
import exploredCohort from './exploredCohort'
import me from './me'
import message from './message'
import { temporalConstraintsMiddleware } from './middlewares'
import onboarding from './onboarding'
import preferences from './preferences'
import project from './project'
import request from './request'
import scope from './scope'
import valueSets from './valueSets'
import questionnairesFormData from './questionnairesFormData'
import preferences from './preferences'
import { temporalConstraintsMiddleware } from './middlewares'
import warningDialog from './warningDialog'

// Combine reducers
export const rootReducer = combineReducers({
  me,
  onboarding,
  preferences,
  cohortCreation: combineReducers({
    criteria,
    request: cohortCreation
  }),
  valueSets,
  questionnairesFormData,
  exploredCohort,
  drawer,
  message,
  project,
  request,
  scope,
  autoLogout,
  warningDialog
})

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: localforage,
  blacklist: ['message', 'warningDialog', 'questionnairesFormData']
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
