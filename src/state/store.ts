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
import medication from './medication'
import criteria from './criteria'
import message from './message'
import patient from './patient'
import project from './project'
import request from './request'
import biology from './biology'
import cohort from './cohort'
import drawer from './drawer'
import scope from './scope'
import pmsi from './pmsi'
import me from './me'
import syncHierarchyTable from './syncHierarchyTable'
import warningDialog from './warningDialog'

const cohortCreationReducer = combineReducers({
  criteria,
  request: cohortCreation
})

const rootReducer = combineReducers({
  me,
  cohortCreation: cohortCreationReducer,
  exploredCohort,
  drawer,
  message,
  project,
  request,
  cohort,
  scope,
  pmsi,
  medication,
  biology,
  patient,
  autoLogout,
  syncHierarchyTable,
  warningDialog
})

const persistConfig = {
  key: 'root',
  storage: localforage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

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

initStateWithPrevTab(store)
export const persistor = persistStore(store)
