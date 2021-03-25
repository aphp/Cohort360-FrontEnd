import React from 'react'

import { Card, CardContent, Divider, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router'

import Title from 'components/Title'
import Button from 'common/CohortButton'
import ResearchTable from 'components/SavedResearch/ResearchTable/ResearchTable'
import { useAppDispatch, useAppSelector } from 'state'
import { deleteUserCohortThunk, setFavoriteCohortThunk } from 'state/userCohorts'

const useStyles = makeStyles((theme) => ({
  button: {
    marginBlock: theme.spacing(2)
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}))

const CohortCard = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { lastCohorts } = useAppSelector((state) => ({
    lastCohorts: state.userCohorts.lastCohorts
  }))

  const handleDeleteCohort = async (cohortId: string) => {
    dispatch(deleteUserCohortThunk({ cohortId }))
  }

  const handleSetCohortFavorite = (cohortId: string) => {
    dispatch(setFavoriteCohortThunk({ cohortId }))
  }
  const handleCreateCohortClick = () => {
    history.push('cohort/new')
  }
  const handleBrowseCreatedCohortsClick = () => {
    history.push('/recherche_sauvegarde')
  }

  return (
    <Card>
      <CardContent>
        <Title>Cohortes</Title>
        <Divider />
        <div className={classes.buttonsContainer}>
          <Button onClick={handleCreateCohortClick} className={classes.button}>
            Créer une nouvelle cohorte
          </Button>
          <Button
            onClick={handleBrowseCreatedCohortsClick}
            className={classes.button}
            disabled={!lastCohorts || lastCohorts.length === 0}
          >
            Voir toutes mes cohortes
          </Button>
        </div>
        <ResearchTable
          researchData={lastCohorts}
          onDeleteCohort={handleDeleteCohort}
          onSetCohortFavorite={handleSetCohortFavorite}
        />
      </CardContent>
    </Card>
  )
}

export default CohortCard
