import React from 'react'
import { Grid, Select, MenuItem } from '@material-ui/core'

import { useAppSelector, useAppDispatch } from 'state'
import { buildCohortCreation, updateTemporalConstraint } from 'state/cohortCreation'
import { MeState } from 'state/me'

import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { temporalConstraints = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))

  const maintenanceIsActive = meState?.maintenance?.active

  const onChangeTemporalConstraint = (value: 'sameEncounter' | 'differentEncounter' | 'none') => {
    dispatch<any>(
      updateTemporalConstraint({
        idList: ['All'],
        constraintType: value
      })
    )
    dispatch<any>(buildCohortCreation({}))
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
        disabled={maintenanceIsActive}
      >
        <MenuItem value={'sameEncounter'}>Tous les critères ont lieu au cours du même séjour</MenuItem>
        {/* <MenuItem value={'differentEncounter'}>Tous les critères ont lieu au cours de séjours différents</MenuItem> */}
        <MenuItem value={'none'}>Aucune contrainte sur les séjours</MenuItem>
      </Select>
    </Grid>
  )
}

export default TemporalConstraintView
