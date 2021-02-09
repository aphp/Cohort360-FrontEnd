import React from 'react'

import { Dialog, DialogActions, DialogContent, Button, Grid, TextField } from '@material-ui/core'
import AutoComplete from '@material-ui/lab/Autocomplete'
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat'

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
  const handleClose = () => onClose()

  return (
    <Dialog open onClose={handleClose}>
      <DialogContent>
        <Grid container>
          <Grid item>
            <AutoComplete
              options={fakeCriteriaList}
              getOptionLabel={(option) => option.display}
              renderInput={(params) => <TextField {...params} label="Critère de début" variant="outlined" />}
            />
          </Grid>
          <Grid item>
            <TrendingFlatIcon />
          </Grid>
          <Grid item>
            <AutoComplete
              options={fakeTemporalConstraint}
              getOptionLabel={(option) => option.display}
              renderInput={(params) => <TextField {...params} label="Contrainte temporelle" variant="outlined" />}
            />
          </Grid>
          <Grid item>
            <TrendingFlatIcon />
          </Grid>
          <Grid item>
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
