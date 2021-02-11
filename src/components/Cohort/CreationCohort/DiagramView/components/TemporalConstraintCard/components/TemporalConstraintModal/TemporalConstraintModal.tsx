import React, { useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  Typography
} from '@material-ui/core'
import AutoComplete from '@material-ui/lab/Autocomplete'
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat'

import { TemporalConstraintType } from 'types'

import useStyles from './styles'

const fakeCriteriaList = [
  {
    id: '1',
    display: 'critère a'
  },
  {
    id: '2',
    display: 'critère b'
  },
  {
    id: '3',
    display: 'critère c'
  },

  {
    id: '4',
    display: 'critère d'
  }
]

const initialState: TemporalConstraintType = {
  type: 'sameEncounter'
}

const TemporalConstraintModal: React.FC<{
  onClose: () => void
}> = ({ onClose }) => {
  const classes = useStyles()
  const handleClose = () => onClose()
  const [currentTemporalConstraint, onChangeTemporalConstraint] = useState<TemporalConstraintType>(initialState)
  // const [currentStartId, onChangeStartId] = useState<'' | null>(null)
  // const [currentEndId, onChangeEndId] = useState<'' | null>(null)

  console.log('initalState', initialState)
  console.log('currentTemporalConstraint', currentTemporalConstraint)

  return (
    <Dialog fullWidth maxWidth="md" open onClose={handleClose}>
      <DialogTitle className={classes.title}>Contrainte Temporelle</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item className={classes.gridItemIdStart}>
            <AutoComplete
              options={fakeCriteriaList}
              getOptionLabel={(option) => option.display}
              renderInput={(params) => <TextField {...params} label="Critère de début" variant="outlined" />}
            />
          </Grid>
          <Grid item className={classes.gridItemTrendingIcon}>
            <TrendingFlatIcon />
          </Grid>
          <Grid item className={classes.gridItemTemporalConstraint}>
            <div id="JE-SUIS-LAAAAAAAAAAAAAA" className={classes.divTemporalConstraintDetail}>
              <Grid>
                <Grid>
                  <DialogTitle className={classes.titleTemporalConstraint}>Type de contrainte</DialogTitle>
                </Grid>
                <Grid>
                  <Select
                    className={classes.selectTemporalConstraint}
                    variant="outlined"
                    value={currentTemporalConstraint.type}
                    onChange={(e) => onChangeTemporalConstraint({ ...currentTemporalConstraint, type: e.target.value })}
                  >
                    <MenuItem value={'SameEncounter'}>est dans le même séjour que</MenuItem>
                    <MenuItem value={'differentEncounter'}>est dans un séjour différent de</MenuItem>
                    <MenuItem value={'directChronologicalOrdering'}>se passe avant</MenuItem>
                    <MenuItem value={'directChronologicalOrderingWithDuration'}>est séparé de x temps de</MenuItem>
                  </Select>
                </Grid>
                {currentTemporalConstraint.type === 'directChronologicalOrderingWithDuration' && (
                  <Grid className={classes.gridTemporalConstraintOptions}>
                    <Grid className={classes.gridTemporalContraintOptionsSelect}>
                      <Typography>Durée</Typography>
                      <Select variant="outlined" className={classes.sizeInput}>
                        <MenuItem value="hour">heures</MenuItem>
                        <MenuItem value="day">jours</MenuItem>
                        <MenuItem value="month">mois</MenuItem>
                        <MenuItem value="year">années</MenuItem>
                      </Select>
                    </Grid>
                    <Grid className={classes.gridTemporalContraintOptionsSelect}>
                      <Typography>Minimum</Typography>
                      <TextField variant="outlined" className={classes.sizeInput} />
                    </Grid>
                    <Grid className={classes.gridTemporalContraintOptionsSelect}>
                      <Typography>Maximum</Typography>
                      <TextField variant="outlined" className={classes.sizeInput} />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </div>
          </Grid>
          <Grid item className={classes.gridItemTrendingIcon}>
            <TrendingFlatIcon />
          </Grid>
          <Grid item className={classes.gridItemIdEnd}>
            <AutoComplete
              options={fakeCriteriaList}
              getOptionLabel={(option) => option.display}
              renderInput={(params) => <TextField {...params} label="Critère de fin" variant="outlined" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Annuler
        </Button>
        <Button onClick={handleClose} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TemporalConstraintModal
