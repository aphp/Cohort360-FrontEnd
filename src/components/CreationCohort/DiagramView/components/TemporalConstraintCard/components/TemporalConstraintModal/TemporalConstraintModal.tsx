import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Tooltip,
  Typography
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, updateTemporalConstraints } from 'state/cohortCreation'

import EventSequenceTable from '../EventSequenceTable/EventSequenceTable'
import TemporalConstraintConfig from '../TemporalConstraintConfig/TemporalConstraintConfig'
import { TemporalConstraintsType } from 'types'

const TemporalConstraint: React.FC<{
  open: boolean
  onClose?: () => void
}> = ({ onClose }) => {
  const { temporalConstraints = [] } = useAppSelector((state) => state.cohortCreation.request)

  const findInitialStateRadio = temporalConstraints.find(({ idList }) => idList[0] === 'All')
  const initialStateRadio = findInitialStateRadio ? findInitialStateRadio.constraintType : 'none'
  const [radioValues, setRadioValues] = useState<TemporalConstraintsType['constraintType']>(initialStateRadio)
  const [newConstraintsList, setNewConstraintsList] = useState<TemporalConstraintsType[]>([...temporalConstraints])

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleConfirm = () => {
    dispatch<any>(updateTemporalConstraints(newConstraintsList))
    dispatch<any>(buildCohortCreation({}))
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      navigate(`/home`)
    }
  }

  const onChangeValue = (value: TemporalConstraintsType['constraintType']) => {
    setRadioValues(value)

    const globalConstraintId = newConstraintsList.findIndex((constraint) => constraint.idList[0] === 'All')
    const _newConstraintsList = [...newConstraintsList]
    _newConstraintsList[globalConstraintId] = { ..._newConstraintsList[globalConstraintId], constraintType: value }
    setNewConstraintsList(_newConstraintsList)
  }

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Contraintes temporelles</DialogTitle>
      <DialogContent>
        <Grid>
          <Typography variant="h3">Contrainte globale sur tous les critères</Typography>
          <RadioGroup
            row
            value={radioValues}
            onChange={(e: any) => onChangeValue(e.target.value)}
            style={{ margin: '1em', justifyContent: 'space-between' }}
          >
            <FormControlLabel value="none" control={<Radio />} label="Aucune contrainte sur les séjours" />
            <FormControlLabel
              value="sameEncounter"
              control={<Radio />}
              label="Tous les critères ont lieu au cours du même séjour"
            />
            <FormControlLabel
              value="differentEncounter"
              control={<Radio />}
              label="Tous les critères ont lieu au cours de séjours différents"
            />
          </RadioGroup>
        </Grid>
        <Grid>
          <Grid item container direction="row" alignItems="center">
            <Typography variant="h3">Séquence d'évènements entre deux critères</Typography>
            <Tooltip title="Les contraintes temporelles ne peuvent être ajoutées que sur le groupe ET principal.">
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </Grid>
          <TemporalConstraintConfig
            newConstraintsList={newConstraintsList}
            onChangeNewConstraintsList={setNewConstraintsList}
          />
          <EventSequenceTable temporalConstraints={newConstraintsList} onChangeConstraints={setNewConstraintsList} />
        </Grid>
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
