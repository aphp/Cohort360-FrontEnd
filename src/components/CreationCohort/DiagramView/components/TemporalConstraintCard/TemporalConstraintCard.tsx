import React, { useState, useEffect } from 'react'
import { Grid, Select, MenuItem } from '@mui/material'

import { useAppSelector, useAppDispatch } from 'state'
import { buildCohortCreation, updateTemporalConstraint } from 'state/cohortCreation'
import { MeState } from 'state/me'

import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { temporalConstraints = [], criteriaGroup = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))

  const [disableTemporalConstraint, onDisableTemporalConstraint] = useState(false)

  const maintenanceIsActive = meState?.maintenance?.active
  const mainTemporalConstraint = temporalConstraints.find(({ idList }) => idList && idList[0] && idList[0] === 'All')

  useEffect(() => {
    if (criteriaGroup && criteriaGroup.length > 0) {
      const mainCriteriaGroup = criteriaGroup.find(({ id }) => id === 0)
      if (!disableTemporalConstraint && mainCriteriaGroup && mainCriteriaGroup.type !== 'andGroup') {
        onDisableTemporalConstraint(true)
        if (mainTemporalConstraint?.constraintType !== 'none') {
          onChangeTemporalConstraint('none')
        }
      }
    }
  }, [])

  const onChangeTemporalConstraint = (value: 'sameEncounter' | 'differentEncounter' | 'none') => {
    dispatch<any>(
      updateTemporalConstraint({
        idList: ['All'],
        constraintType: value
      })
    )
    dispatch<any>(buildCohortCreation({}))
  }

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
        disabled={maintenanceIsActive || disableTemporalConstraint}
      >
        <MenuItem value={'sameEncounter'}>Tous les critères ont lieu au cours du même séjour</MenuItem>
        {/* <MenuItem value={'differentEncounter'}>Tous les critères ont lieu au cours de séjours différents</MenuItem> */}
        <MenuItem value={'none'}>Aucune contrainte sur les séjours</MenuItem>
      </Select>
    </Grid>
  )
}

export default TemporalConstraintView
