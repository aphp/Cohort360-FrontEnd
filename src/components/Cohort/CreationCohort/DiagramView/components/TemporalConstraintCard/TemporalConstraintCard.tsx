import React, { useState } from 'react'
import { Grid, Typography, Select, MenuItem } from '@material-ui/core'

import { TemporalConstraintType } from 'types'
import useStyles from './styles'

const initialState: TemporalConstraintType = {
  type: 'none'
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
        <MenuItem value={'sameEncounter'}>Tous les critères ont lieu au cours du meme séjour</MenuItem>
        <MenuItem value={'differentEncounter'}>Tous les critères ont lieu au cours de séjours différents</MenuItem>
        <MenuItem value={'none'}>Aucune contrainte sur les séjours</MenuItem>
      </Select>
    </Grid>
  )
}

export default TemporalConstraintView
