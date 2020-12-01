import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { createLogger } from 'redux-logger'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import cohortCreation from './cohortCreation'
import exploredCohort from './exploredCohort'
import me from './me'
import drawer from './drawer'

const persistConfig = {
  key: 'root',
  storage
}

const rootReducer = combineReducers({
  me,
  cohortCreation,
  exploredCohort,
  drawer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return [
      ...getDefaultMiddleware({
        thunk: true,
        serializableCheck: false,
        immutableCheck: false
      }),
      createLogger({})
    ]
  }
})

export const persistor = persistStore(store)
