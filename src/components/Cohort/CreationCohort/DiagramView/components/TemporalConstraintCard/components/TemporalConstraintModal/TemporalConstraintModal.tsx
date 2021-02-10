import React from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  Typography
} from '@material-ui/core'
import AutoComplete from '@material-ui/lab/Autocomplete'
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat'

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

const fakeTemporalConstraint = [
  {
    id: '1',
    display: 'Temporal constraint a'
  },
  {
    id: '2',
    display: 'Temporal constraint b'
  },
  {
    id: '3',
    display: 'Temporal constraint c'
  },

  {
    id: '4',
    display: 'Temporal constraint d'
  }
]

const TemporalConstraintModal: React.FC<{
  onClose: () => void
}> = ({ onClose }) => {
  const classes = useStyles()
  const handleClose = () => onClose()

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
                  <AutoComplete
                    className={classes.autoCompleteTemporalConstraint}
                    options={fakeTemporalConstraint}
                    getOptionLabel={(option) => option.display}
                    renderInput={(params) => <TextField {...params} label="Contrainte temporelle" variant="outlined" />}
                  />
                </Grid>
                <Grid>
                  <p>je m'active que quand une certaine contrainte est séléctionnée</p>
                </Grid>
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
