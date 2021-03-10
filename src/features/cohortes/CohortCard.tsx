import React from 'react'

import { Card, CardContent, Divider, makeStyles } from '@material-ui/core'

import Title from 'components/Title'
import Button from 'common/CohortButton'
import ResearchTable from 'components/SavedResearch/ResearchTable/ResearchTable'
import { useAppDispatch, useAppSelector } from 'state'
import { deleteUserCohortThunk, setFavoriteCohortThunk } from 'state/userCohorts'

const useStyles = makeStyles((theme) => ({
  button: {
    marginBlock: theme.spacing(2)
  }
}))

const CohortCard = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { lastCohorts } = useAppSelector((state) => ({
    lastCohorts: state.userCohorts.lastCohorts
  }))

  const handleDeleteCohort = async (cohortId: string) => {
    dispatch(deleteUserCohortThunk({ cohortId }))
  }

  const handleSetCohortFavorite = (cohortId: string) => {
    dispatch(setFavoriteCohortThunk({ cohortId }))
  }

  return (
    <Card>
      <CardContent>
        <Title>Cohortes</Title>
        <Divider />
        <Button href="cohort/new" className={classes.button}>
          Créer une nouvelle cohorte
        </Button>
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
