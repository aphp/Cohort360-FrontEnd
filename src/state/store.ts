import { applyMiddleware, combineReducers, createStore } from 'redux'
import logger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import localforage from 'localforage'
import { persistReducer, persistStore } from 'redux-persist'

import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync'

import autoLogout from './autoLogout'
import biology from './biology'
import cohort from './cohort'
import cohortCreation from './cohortCreation'
import criteria from './criteria'
import drawer from './drawer'
import exploredCohort from './exploredCohort'
import me from './me'
import medication from './medication'
import message from './message'
import patient from './patient'
import pmsi from './pmsi'
import project from './project'
import request from './request'
import scope from './scope'

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
  autoLogout
})

const persistConfig = {
  key: 'root',
  storage: localforage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(
  persistedReducer,
  applyMiddleware(
    thunkMiddleware,
    logger,
    createStateSyncMiddleware({
      blacklist: ['persist/PERSIST', 'persist/REHYDRATE']
    })
  )
)
initMessageListener(store)
export const persistor = persistStore(store)
