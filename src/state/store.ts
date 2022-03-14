import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'

import { persistStore, persistReducer } from 'redux-persist'
import localforage from 'localforage'

import cohortCreation from './cohortCreation'
import criteria from './criteria'
import exploredCohort from './exploredCohort'
import me from './me'
import drawer from './drawer'
import message from './message'
import project from './project'
import request from './request'
import cohort from './cohort'
import scope from './scope'
import pmsi from './pmsi'
import medication from './medication'
import biology from './biology'
import patient from './patient'

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
  patient
})

const persistConfig = {
  key: 'root',
  storage: localforage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, applyMiddleware(thunkMiddleware, logger))
export const persistor = persistStore(store)
