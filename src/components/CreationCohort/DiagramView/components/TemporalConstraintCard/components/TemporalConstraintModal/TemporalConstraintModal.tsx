import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, updateTemporalConstraints } from 'state/cohortCreation'

import EventSequenceTable from '../EventSequenceTable/EventSequenceTable'
import TemporalConstraintConfig from '../TemporalConstraintConfig/TemporalConstraintConfig'
import { CriteriaGroupType, TemporalConstraintsKind, TemporalConstraintsType } from 'types'
import StayConstraints from './StayConstraints'
import EpisodeConstraints from './EpisodeConstraints'

const TemporalConstraint: React.FC<{
  open: boolean
  onClose?: () => void
}> = ({ onClose }) => {
  const { temporalConstraints = [], criteriaGroup } = useAppSelector((state) => state.cohortCreation.request)
  const [stayConstraints, setStayConstraints] = useState<TemporalConstraintsType[]>(
    temporalConstraints.filter(
      (constraint) =>
        constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER ||
        constraint.constraintType === TemporalConstraintsKind.DIFFERENT_ENCOUNTER
    )
  )
  const [episodeConstraints, setEpisodeConstraints] = useState<TemporalConstraintsType[]>(
    temporalConstraints.filter(
      (constraint) =>
        constraint.constraintType === TemporalConstraintsKind.SAME_EPISODE_OF_CARE ||
        constraint.constraintType === TemporalConstraintsKind.DIFFERENT_EPISODE_OF_CARE
    )
  )
  const [chronologicalConstraints, setChronologicalConstraints] = useState<TemporalConstraintsType[]>(
    temporalConstraints.filter(
      (constraint) => constraint.constraintType === TemporalConstraintsKind.DIRECT_CHRONOLOGICAL_ORDERING
    )
  )

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleConfirm = () => {
    dispatch(updateTemporalConstraints([...stayConstraints, ...chronologicalConstraints, ...episodeConstraints]))
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      navigate(`/home`)
    }
  }

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Contraintes temporelles</DialogTitle>
      <DialogContent>
        <StayConstraints constraints={stayConstraints} onChangeConstraints={setStayConstraints} />
        {criteriaGroup[0].type !== CriteriaGroupType.OR_GROUP && (
          <Grid>
            <Grid container sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="h3">Séquence d'évènements entre deux critères</Typography>
              <Tooltip title="Les contraintes temporelles ne peuvent être ajoutées que sur le groupe ET principal.">
                <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
              </Tooltip>
            </Grid>
            <TemporalConstraintConfig
              newConstraintsList={chronologicalConstraints}
              onChangeNewConstraintsList={setChronologicalConstraints}
            />
            <EventSequenceTable
              temporalConstraints={chronologicalConstraints}
              onChangeConstraints={setChronologicalConstraints}
            />
          </Grid>
        )}
        <EpisodeConstraints constraints={episodeConstraints} onChangeConstraints={setEpisodeConstraints} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TemporalConstraint
