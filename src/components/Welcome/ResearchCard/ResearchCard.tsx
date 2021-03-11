import React from 'react'
import { Grid, Link } from '@material-ui/core'

import Title from '../../Title'
import ResearchTable from '../../SavedResearch/ResearchTable/ResearchTable'

import { setFavoriteCohortThunk, deleteUserCohortThunk } from 'state/userCohorts'
import { FormattedCohort } from 'types'
import { useAppDispatch } from 'state'

import useStyles from './styles'

type ResearchCardProps = {
  simplified?: boolean
  onClickRow?: (props: any) => void
  title?: string
  cohorts?: FormattedCohort[]
}

const ResearchCard: React.FC<ResearchCardProps> = ({ onClickRow, simplified, title, cohorts }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const onDeleteCohort = async (cohortId: string) => {
    dispatch(deleteUserCohortThunk({ cohortId }))
  }

  const onSetCohortFavorite = (cohortId: string) => {
    dispatch(setFavoriteCohortThunk({ cohortId }))
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          <Title>{title}</Title>
        </Grid>
        <Grid item container xs={3} justify="flex-end">
          <Link underline="always" className={classes.link} href="/recherche_sauvegarde">
            Voir toutes mes cohortes
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.tableContainer}>
        <ResearchTable
          simplified={simplified}
          researchData={cohorts}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
        />
      </Grid>
    </>
  )
}

export default ResearchCard
