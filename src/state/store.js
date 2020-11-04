import { applyMiddleware, combineReducers, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import { createLogger } from 'redux-logger'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import cohortCreation from './cohortCreation'
import exploredCohort from './exploredCohort'
import me from './me'
import practitioner from './practitioner'
import drawer from './drawer'

const persistConfig = {
  key: 'root',
  storage
}

const appReducer = combineReducers({
  me,
  cohortCreation,
  exploredCohort,
  practitioner,
  drawer
})

// actions
export const logout = () => {
  return {
    type: 'LOGOUT',
    payload: {}
  }
}

// reducer
export const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    state = undefined
  }

  return appReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const createStoreWithMiddlewares = applyMiddleware(createLogger({}))(
  createStore
)

export const store = createStoreWithMiddlewares(persistedReducer)
export const persistor = persistStore(store)
