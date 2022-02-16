import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'

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

export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, logger))

store.subscribe(() => {
  // Auto save store inside localStorage
  const state = store.getState() ?? {}
  const { me, exploredCohort, cohortCreation, project, request, cohort, scope, pmsi, medication, biology, patient } =
    state

  localStorage.setItem('user', JSON.stringify(me))
  localStorage.setItem('exploredCohort', JSON.stringify(exploredCohort))
  localStorage.setItem(
    'cohortCreation',
    JSON.stringify({
      ...cohortCreation,
      request: {
        ...cohortCreation.request,
        snapshotsHistory:
          cohortCreation.request.snapshotsHistory && cohortCreation.request.snapshotsHistory.length > 0
            ? cohortCreation.request.snapshotsHistory.slice(0, 50)
            : []
      }
    })
  )

  localStorage.setItem('project', JSON.stringify(project))

  localStorage.setItem(
    'request',
    JSON.stringify({
      ...request,
      requestsList:
        request.requestsList && request.requestsList.length > 0
          ? request.requestsList.map((requestsList) => ({
              ...requestsList,
              query_snapshots: []
            }))
          : []
    })
  )
  localStorage.setItem('cohort', JSON.stringify(cohort))
  localStorage.setItem('scope', JSON.stringify(scope))
  localStorage.setItem('pmsi', JSON.stringify(pmsi))
  localStorage.setItem('medication', JSON.stringify(medication))
  localStorage.setItem('biology', JSON.stringify(biology))
  localStorage.setItem('patient', JSON.stringify(patient))
})
