import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import { createLogger } from 'redux-logger'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import cohortCreation from './cohortCreation'
import criteria from './criteria'
import exploredCohort from './exploredCohort'
import me from './me'
import drawer from './drawer'

const MapTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: any) => {
    // convert exploredCohort to an Array.
    return {
      ...inboundState,
      agePyramidData: inboundState.agePyramidData ? [...inboundState.agePyramidData] : [],
      genderRepartitionMap: inboundState.genderRepartitionMap ? [...inboundState.genderRepartitionMap] : [],
      monthlyVisitData: inboundState.monthlyVisitData ? [...inboundState.monthlyVisitData] : []
    }
  },
  // transform state being rehydrated
  (outboundState: any) => {
    // convert back to a Map.
    return {
      ...outboundState,
      agePyramidData: outboundState.agePyramidData ? new Map(outboundState.agePyramidData) : new Map(),
      genderRepartitionMap: outboundState.genderRepartitionMap
        ? new Map(outboundState.genderRepartitionMap)
        : new Map(),
      monthlyVisitData: outboundState.monthlyVisitData ? new Map(outboundState.monthlyVisitData) : new Map()
    }
  },
  // define which reducers this transform gets called for.
  { whitelist: ['exploredCohort'] }
)

const persistConfig = {
  key: 'root',
  storage,
  // blacklist: ['criteria'],
  transforms: [MapTransform]
}

const cohortCreationReducer = combineReducers({
  criteria,
  request: cohortCreation
})

const rootReducer = combineReducers({
  me,
  cohortCreation: cohortCreationReducer,
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
