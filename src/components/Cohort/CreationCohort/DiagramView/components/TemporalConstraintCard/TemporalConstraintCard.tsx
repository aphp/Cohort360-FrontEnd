import React from 'react'
import { useDispatch } from 'react-redux'
import { Grid, Select, MenuItem } from '@material-ui/core'

import { useAppSelector } from 'state'
import { buildCohortCreation, updateTemporalConstraint } from 'state/cohortCreation'

import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const { temporalConstraints = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const onChangeTemporalConstraint = (value: 'sameEncounter' | 'differentEncounter' | 'none') => {
    dispatch(
      updateTemporalConstraint({
        idList: ['All'],
        constraintType: value
      })
    )
    dispatch(buildCohortCreation({}))
  }

  const mainTemporalConstraint = temporalConstraints.find(({ idList }) => idList && idList[0] && idList[0] === 'All')

  return (
    <Grid
      className={classes.root}
      style={{
        backgroundColor: mainTemporalConstraint?.constraintType === 'none' ? '#DEDEDE' : '#FFE2A9'
      }}
    >
      <Select
        classes={{ icon: classes.selectIcon }}
        className={classes.temporalConstraintSelect}
        value={mainTemporalConstraint ? mainTemporalConstraint.constraintType : 'none'}
        onChange={(e: any) => onChangeTemporalConstraint(e.target.value)}
      >
        <MenuItem value={'sameEncounter'}>Tous les critères ont lieu au cours du même séjour</MenuItem>
        <MenuItem value={'differentEncounter'}>Tous les critères ont lieu au cours de séjours différents</MenuItem>
        <MenuItem value={'none'}>Aucune contrainte sur les séjours</MenuItem>
      </Select>
    </Grid>
  )
}

export default TemporalConstraintView
