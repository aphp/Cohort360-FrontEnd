import React, { useState } from 'react'
import { Grid, Typography, Select, MenuItem } from '@material-ui/core'

import { TemporalConstraintType } from 'types'
import useStyles from './styles'

const initialState: TemporalConstraintType = {
  type: 'noDifference'
}

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()
  const [currentTemporalConstraint, onChangeTemporalConstraint] = useState<TemporalConstraintType>(initialState)

  return (
    <Grid className={classes.root}>
      <Typography className={classes.temporalConstraintTypo}>Contrainte temporelle :</Typography>
      <Select
        className={classes.temporalConstraintSelect}
        // variant="filled"
        value={currentTemporalConstraint.type}
        onChange={(e) => onChangeTemporalConstraint({ ...currentTemporalConstraint, type: e.target.value })}
      >
        <MenuItem value={'SameEncounter'}>Tous les critères sont dans la meme visite</MenuItem>
        <MenuItem value={'differentEncounter'}>Les critères sont dans des visites différentes</MenuItem>
        <MenuItem value={'noDifference'}>indifférent</MenuItem>
      </Select>
    </Grid>
  )
}

export default TemporalConstraintView
