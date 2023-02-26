import React from 'react'

import { Avatar, IconButton, Typography } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import WarningIcon from '@material-ui/icons/Warning'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

import useStyles from './styles'
import { SelectedCriteriaType } from 'types'

type CriteriaCardProps = {
  itemId: number
  duplicateCriteria: (criteriaId: number) => void
  deleteCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType) => void
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ itemId, duplicateCriteria, editCriteria, deleteCriteria }) => {
  const classes = useStyles()

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const { selectedCriteria = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const currentCriterion = selectedCriteria.find((criteria) => criteria.id === itemId)
  if (!currentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

  return (
    <div
      className={classes.criteriaItem}
      style={{ backgroundColor: currentCriterion.isInclusive ? '#D1E2F4' : '#F2B0B0' }}
    >
      <div className={classes.criteriaTitleAndChips}>
        <Avatar style={{ backgroundColor: '#5bc5f2', width: 24, height: 24, fontSize: 14 }}>
          {currentCriterion.id}
        </Avatar>
        <Typography className={classes.title}>- {currentCriterion.title} :</Typography>
        <CriteriaCardContent currentCriteria={currentCriterion} />
      </div>
      <div className={classes.actionContainer}>
        {currentCriterion.error ? (
          <IconButton
            size="small"
            onClick={() => editCriteria(currentCriterion)}
            color="secondary"
            disabled={maintenanceIsActive}
          >
            <WarningIcon />
          </IconButton>
        ) : (
          <></>
        )}
        <IconButton
          size="small"
          onClick={() => duplicateCriteria(currentCriterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <LibraryAddIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => editCriteria(currentCriterion)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => deleteCriteria(currentCriterion.id)}
          style={maintenanceIsActive ? { color: '#CBCFCF' } : { color: 'currentcolor' }}
          disabled={maintenanceIsActive}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  )
}

export default CriteriaCard
