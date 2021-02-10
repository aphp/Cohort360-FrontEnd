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
  MenuItem
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
                    className={classes.SelectTemporalConstraint}
                    variant="outlined"
                    value={currentTemporalConstraint.type}
                    onChange={(e) => onChangeTemporalConstraint({ ...currentTemporalConstraint, type: e.target.value })}
                  >
                    <MenuItem value={'SameEncounter'}>Même visite</MenuItem>
                    <MenuItem value={'differentEncounter'}>Différente visite</MenuItem>
                    <MenuItem value={'directChronologicalOrdering'}>Visite ordonné chronologiquement</MenuItem>
                    <MenuItem value={'directChronologicalOrderingWithDuration'}>
                      Visite ordonné chronologiquement séparé par une durée
                    </MenuItem>
                  </Select>
                </Grid>
                {currentTemporalConstraint.type === 'directChronologicalOrderingWithDuration' && (
                  <Grid>
                    <p>je m'active que quand une certaine contrainte est séléctionnée</p>
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
