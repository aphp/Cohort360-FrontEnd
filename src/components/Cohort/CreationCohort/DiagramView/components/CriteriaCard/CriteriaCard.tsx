import React from 'react'

import { IconButton, Typography } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'

import { useAppSelector } from 'state'

import useStyles from './styles'
import { SelectedCriteriaType } from 'types'

type CriteriaCardProps = {
  itemId: number
  deleteCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType) => void
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ itemId, editCriteria, deleteCriteria }) => {
  const classes = useStyles()

  const { selectedCriteria = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const CurrentCriterion = selectedCriteria.find((criteria) => criteria.id === itemId)
  if (!CurrentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

  return (
    <div
      className={classes.criteriaItem}
      style={{ backgroundColor: !CurrentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <div className={classes.criteriaTitleAndChips}>
        <Typography>{CurrentCriterion.title} :</Typography>
        <CriteriaCardContent currentCriteria={CurrentCriterion} />
        <IconButton size="small" onClick={() => editCriteria(CurrentCriterion)} style={{ color: 'currentcolor' }}>
          <EditIcon />
        </IconButton>
      </div>
      <IconButton size="small" onClick={() => deleteCriteria(CurrentCriterion.id)} style={{ color: 'currentcolor' }}>
        <DeleteIcon />
      </IconButton>
    </div>
  )
}

export default CriteriaCard
