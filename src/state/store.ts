import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'

import cohortCreation from './cohortCreation'
import criteria from './criteria'
import exploredCohort from './exploredCohort'
import userCohorts from './userCohorts'
import me from './me'
import drawer from './drawer'
import message from './message'

const cohortCreationReducer = combineReducers({
  criteria,
  request: cohortCreation
})

const rootReducer = combineReducers({
  me,
  cohortCreation: cohortCreationReducer,
  exploredCohort,
  userCohorts,
  drawer,
  message
})

export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, logger))

store.subscribe(() => {
  // Auto save store inside localStorage
  const _store = store.getState() ?? {}
  const { me, exploredCohort, userCohorts, cohortCreation } = _store

  localStorage.setItem('user', JSON.stringify(me))
  localStorage.setItem(
    'exploredCohort',
    JSON.stringify({
      ...exploredCohort,
      agePyramidData: exploredCohort.agePyramidData ? [...exploredCohort.agePyramidData] : [],
      genderRepartitionMap: exploredCohort.genderRepartitionMap ? [...exploredCohort.genderRepartitionMap] : [],
      monthlyVisitData: exploredCohort.monthlyVisitData ? [...exploredCohort.monthlyVisitData] : []
    })
  )
  localStorage.setItem('userCohorts', JSON.stringify(userCohorts))
  localStorage.setItem('cohortCreation', JSON.stringify(cohortCreation))
})
