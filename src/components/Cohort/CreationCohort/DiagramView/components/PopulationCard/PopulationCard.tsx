import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { Button, Chip, CircularProgress, IconButton, Typography } from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'

import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppSelector } from 'state'
import { buildCreationCohort } from 'state/cohortCreation'

import { ScopeTreeRow } from 'types'

import useStyles from './styles'

const PopulationCard: React.FC = () => {
  const { selectedPopulation = [], loading = false } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()
  const dispatch = useDispatch()

  const [openDrawer, onChangeOpenDrawer] = useState(false)

  const submitPopulation = (_selectedPopulation: ScopeTreeRow[] | null) => {
    dispatch(buildCreationCohort({ selectedPopulation: _selectedPopulation }))
    onChangeOpenDrawer(false)
  }

  return (
    <>
      {loading ? (
        <div className={classes.newPopulationCard}>
          <div className={classes.centerContainer}>
            <CircularProgress />
          </div>
        </div>
      ) : selectedPopulation !== null ? (
        <div className={classes.newPopulationCard}>
          <div className={classes.leftDiv}>
            <Typography variant="h6" align="left">
              Population source :
            </Typography>

            <div className={classes.chipContainer}>
              {selectedPopulation &&
                selectedPopulation
                  .slice(0, 4)
                  .map((pop: any, index: number) => (
                    <Chip className={classes.populationChip} key={`${index}-${pop.name}`} label={pop.name} />
                  ))}
              {selectedPopulation && selectedPopulation.length > 4 && (
                <Typography component="span" align="center" className={classes.populationLabel}>
                  ...
                </Typography>
              )}
            </div>
          </div>
          <IconButton size="small" onClick={() => onChangeOpenDrawer(true)} style={{ color: 'currentcolor' }}>
            <EditIcon />
          </IconButton>
        </div>
      ) : (
        <div className={classes.centerContainer}>
          <Button className={classes.actionButton} onClick={() => onChangeOpenDrawer(true)}>
            Choisir une population source
          </Button>
        </div>
      )}

      <PopulationRightPanel open={openDrawer} onConfirm={submitPopulation} onClose={() => onChangeOpenDrawer(false)} />
    </>
  )
}

export default PopulationCard
