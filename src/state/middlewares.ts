import { RootState } from 'state'
import { deleteSelectedCriteria, moveCriteria } from './cohortCreation'
import { setMessage } from './message'
import { isEqual } from 'lodash'
import type { Middleware } from 'redux'

export const temporalConstraintsMiddleware: Middleware<RootState> = (store) => (next) => (action: any) => {
  const prevState = store.getState()
  const result = next(action)
  const nextState = store.getState()
  const isTemporalConstraintAction = action.type === moveCriteria.type || action.type === deleteSelectedCriteria.type
  if (isTemporalConstraintAction) {
    const prevConstraints = prevState.cohortCreation.request.temporalConstraints
    const nextConstraints = nextState.cohortCreation.request.temporalConstraints

    const constraintWasRemoved = !isEqual(prevConstraints, nextConstraints)

    if (constraintWasRemoved) {
      store.dispatch(
        setMessage({
          type: 'info',
          content: 'Le critère a été retiré de la contrainte temporelle.'
        })
      )
    }
  }

  return result
}
