import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useEditCohort from 'hooks/researches/useEditCohort'
import { Cohort } from 'types'

type CohortItemActions = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onSelectCohort: (cohort: Cohort) => void
}

type CohortItemActionsProps = {
  navigate: ReturnType<typeof useNavigate>
  toggleSelection: (c: Cohort) => void
  parentCohortId?: string
}

const useCohortItemActions = ({ navigate, toggleSelection }: CohortItemActionsProps): CohortItemActions => {
  const editCohortMutation = useEditCohort()

  const onClickRow = useCallback(
    (cohort: Cohort) => {
      const searchParams = new URLSearchParams()
      if (cohort.group_id) searchParams.set('groupId', cohort.group_id)
      navigate(`/cohort?${searchParams.toString()}`)
    },
    [navigate]
  )

  const onClickFav = useCallback(
    (cohort: Cohort) => {
      editCohortMutation.mutate({ ...cohort, favorite: !cohort.favorite })
    },
    [editCohortMutation]
  )

  const onClickExport = useCallback(
    (cohort: Cohort) => {
      const searchParams = new URLSearchParams()
      if (cohort.group_id) searchParams.set('groupId', cohort.group_id)
      navigate(`/exports/new?${searchParams.toString()}`)
    },
    [navigate]
  )

  return {
    onClickRow,
    onClickFav,
    onClickExport,
    onSelectCohort: toggleSelection
  }
}

export default useCohortItemActions
