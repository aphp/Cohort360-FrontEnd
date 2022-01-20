import React from 'react'

import { IconButton, Typography } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import WarningIcon from '@material-ui/icons/Warning'

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

  const currentCriterion = selectedCriteria.find((criteria) => criteria.id === itemId)
  if (!currentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

  return (
    <div
      className={classes.criteriaItem}
      style={{ backgroundColor: currentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <div className={classes.criteriaTitleAndChips}>
        <Typography className={classes.title}>{currentCriterion.title} :</Typography>
        <CriteriaCardContent currentCriteria={currentCriterion} />
      </div>
      <div className={classes.actionContainer}>
        {currentCriterion.error ? (
          <IconButton size="small" onClick={() => editCriteria(currentCriterion)} color="secondary">
            <WarningIcon />
          </IconButton>
        ) : (
          <></>
        )}
        <IconButton size="small" onClick={() => editCriteria(currentCriterion)} style={{ color: 'currentcolor' }}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => deleteCriteria(currentCriterion.id)} style={{ color: 'currentcolor' }}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  )
}

export default CriteriaCard
