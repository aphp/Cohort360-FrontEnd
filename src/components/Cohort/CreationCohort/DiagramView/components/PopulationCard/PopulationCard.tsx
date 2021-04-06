import React, { useState } from 'react'

import { Button, Card, CardHeader, CardContent, CircularProgress, IconButton, Typography } from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'

import PopulationRightPanel from './components/PopulationRightPanel'

import { useAppSelector, useAppDispatch } from 'state'
import { buildCreationCohort } from 'state/cohortCreation'

import { ScopeTreeRow } from 'types'

import useStyles from './styles'
import { unwrapResult } from '@reduxjs/toolkit'

const PopulationCard: React.FC = () => {
  const { selectedPopulation = [], loading = false } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()
  const dispatch = useAppDispatch()

  const [openDrawer, onChangeOpenDrawer] = useState(false)
  const [isLoadingSubmit, setLoadingSubmit] = useState(false)

  const submitPopulation = (_selectedPopulation: ScopeTreeRow[] | null) => {
    setLoadingSubmit(true)
    dispatch(buildCreationCohort({ selectedPopulation: _selectedPopulation }))
      .then(unwrapResult)
      .finally(() => {
        setLoadingSubmit(false)
        onChangeOpenDrawer(false)
      })
  }

  return (
    <>
      <div className={selectedPopulation !== null ? classes.root : ''}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.cardHeader}
            action={
              selectedPopulation !== null && (
                <IconButton size="small" onClick={() => onChangeOpenDrawer(true)} style={{ color: 'currentcolor' }}>
                  <EditIcon />
                </IconButton>
              )
            }
            title="Population source"
          />
          <CardContent className={classes.cardContent}>
            {selectedPopulation === null && loading === true ? (
              <CircularProgress />
            ) : selectedPopulation !== null ? (
              <>
                <Typography align="center">Patients ayant été pris en charge à :</Typography>
                {selectedPopulation &&
                  selectedPopulation.slice(0, 3).map((pop: any, index: number) => (
                    <Typography key={`${index}-${pop.name}`} align="center" className={classes.populationLabel}>
                      {pop.name}
                    </Typography>
                  ))}
                {selectedPopulation && selectedPopulation.length > 3 && (
                  <Typography align="center" className={classes.populationLabel}>
                    ...
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography align="center">
                  Sur quelle population source souhaitez-vous baser votre requête ?
                </Typography>

                <div className={classes.actionButtonContainer}>
                  <Button
                    onClick={() => onChangeOpenDrawer(true)}
                    variant="contained"
                    color="primary"
                    className={classes.actionButton}
                  >
                    <Typography variant="h5">Structure hospitalière</Typography>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <PopulationRightPanel
        isLoadingSubmit={isLoadingSubmit}
        open={openDrawer}
        onConfirm={submitPopulation}
        onClose={() => onChangeOpenDrawer(false)}
      />
    </>
  )
}

export default PopulationCard
