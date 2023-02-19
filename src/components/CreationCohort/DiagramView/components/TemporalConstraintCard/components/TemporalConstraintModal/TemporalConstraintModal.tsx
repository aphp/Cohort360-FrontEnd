import React, { useState } from 'react'
import { useHistory } from 'react-router'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@material-ui/core'

import { useAppDispatch, useAppSelector } from 'state'
import { buildCohortCreation, updateTemporalConstraint } from 'state/cohortCreation'

import EventSequenceTable from '../EventSequenceTable/EventSequenceTable'
import TemporalConstraintConfig from '../TemporalConstraintConfig/TemporalConstraintConfig'

// import useStyles from '../../styles'

const TemporalConstraint: React.FC<{
  open: boolean
  onClose?: () => void
}> = ({ onClose }) => {
  const { temporalConstraints = [] } = useAppSelector((state) => state.cohortCreation.request)

  const findInitialStateRadio = temporalConstraints.find(({ idList }) => idList[0] === 'All')
  const initialStateRadio = findInitialStateRadio ? findInitialStateRadio.constraintType : 'none'
  const [radioValues, setRadioValues] = useState<
    'none' | 'sameEncounter' | 'differentEncounter' | 'directChronologicalOrdering'
  >(initialStateRadio)

  // const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()

  const handleConfirm = () => {
    dispatch<any>(
      updateTemporalConstraint({
        idList: ['All'],
        constraintType: radioValues
      })
    )
    dispatch<any>(buildCohortCreation({}))
  }

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      history.push(`/home`)
    }
  }

  const onChangeValue = (value: 'none' | 'sameEncounter' | 'differentEncounter') => {
    setRadioValues(value)
  }

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle>
        <Typography variant="h3">Contraintes temporelles</Typography>
      </DialogTitle>
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
          <Typography variant="h3">Séquence d'évènements entre deux critères</Typography>
          <TemporalConstraintConfig />
          <EventSequenceTable />
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
