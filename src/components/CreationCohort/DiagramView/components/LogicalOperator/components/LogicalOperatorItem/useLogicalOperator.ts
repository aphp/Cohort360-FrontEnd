import { useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import {
  buildCohortCreation,
  deleteCriteriaGroup,
  editCriteriaGroup,
  updateTemporalConstraints
} from 'state/cohortCreation'
import { CriteriaGroup, CriteriaGroupType } from 'types'
import { getOptionsForGroupType, hasOptions } from './utils'

export const useLogicalOperator = (itemId: number) => {
  const dispatch = useAppDispatch()
  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { criteriaGroup, temporalConstraints } = request

  const isMainOperator = useMemo(() => itemId === 0, [itemId])
  const currentOperator = useMemo(() => criteriaGroup.find(({ id }) => id === itemId), [criteriaGroup, itemId])

  const edit = useCallback(
    (payload: CriteriaGroup) => {
      dispatch(editCriteriaGroup(payload))
      dispatch(buildCohortCreation({ selectedPopulation: null }))
    },
    [dispatch]
  )

  const deleteLogicalOperator = () => {
    dispatch(deleteCriteriaGroup(itemId))
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const deleteInvalidConstraints = () => {
    if (!currentOperator) return
    const currentLogicalOperatorCriteriaIds = currentOperator.criteriaIds ?? []
    const correctConstraints = temporalConstraints.filter((constraint) => {
      const constraintsInAndGroup = !(constraint.idList as number[]).some((criteriaId: number) =>
        currentLogicalOperatorCriteriaIds.includes(criteriaId)
      )
      const noGlobalConstraints = itemId !== 0 || !constraint.idList.includes('All' as never)
      return constraintsInAndGroup && noGlobalConstraints
    })
    dispatch(updateTemporalConstraints(correctConstraints))
  }

  const handleChangeInclusive = useCallback(
    (value: boolean) => {
      if (currentOperator)
        edit({
          ...currentOperator,
          isInclusive: value
        })
    },
    [currentOperator, edit]
  )

  const handleChangeNumber = useCallback(
    (value: number) => {
      if (hasOptions(currentOperator))
        edit({
          ...currentOperator,
          options: {
            ...currentOperator.options,
            number: value
          }
        })
    },
    [currentOperator, edit]
  )

  const handleChangeOperator = useCallback(
    (value: CriteriaGroupType) => {
      if (!currentOperator) return
      const { id, title, criteriaIds, isSubGroup, isInclusive } = currentOperator
      const newOperator = getOptionsForGroupType(value)
      const logicalOperator = {
        id,
        title,
        criteriaIds,
        isSubGroup,
        isInclusive,
        type: newOperator.type,
        ...(newOperator.type === CriteriaGroupType.N_AMONG_M && {
          options: newOperator.options
        })
      }
      edit(logicalOperator as CriteriaGroup)
    },
    [currentOperator, edit]
  )

  useEffect(() => {
    if (hasOptions(currentOperator)) {
      const { number } = currentOperator.options
      const total = currentOperator.criteriaIds.length
      if (number === 0 && total > 0) handleChangeNumber(1)
      else if (number > total) handleChangeNumber(total)
    }
  }, [itemId, currentOperator, handleChangeNumber])

  return {
    isMainOperator,
    currentOperator,
    handleChangeInclusive,
    handleChangeNumber,
    handleChangeOperator,
    deleteLogicalOperator,
    deleteInvalidConstraints
  }
}
