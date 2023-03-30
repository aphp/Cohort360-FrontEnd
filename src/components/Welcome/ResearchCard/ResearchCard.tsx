import React from 'react'
import { Grid, Link, CircularProgress, Typography } from '@mui/material'

import ResearchTable from 'components/SavedResearch/ResearchTable/ResearchTable'
import RequestsTable from 'components/SavedResearch/ResearchTable/RequestsTable'

import { Cohort, RequestType } from 'types'
import { useAppDispatch } from 'state'
import { deleteCohort, editCohort, fetchCohorts } from 'state/cohort'

import useStyles from './styles'

type ResearchCardProps = {
  simplified?: boolean
  onClickLink?: (props: any) => void
  onClickRow?: (props: any) => void
  title?: string
  linkLabel?: string
  cohorts?: Cohort[]
  requests?: RequestType[]
  loading?: boolean
  listType?: 'FavoriteCohorts' | 'LastCohorts'
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  onClickRow,
  onClickLink,
  simplified,
  title,
  linkLabel,
  cohorts,
  requests,
  loading,
  listType
}) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const onDeleteCohort = async (cohort: Cohort) => {
    await dispatch<any>(deleteCohort({ deletedCohort: cohort }))
    updateCohorts()
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch<any>(editCohort({ editedCohort: { ...cohort, favorite: !cohort.favorite } }))
    updateCohorts()
  }

  const updateCohorts = async () => {
    if (listType === 'FavoriteCohorts' || listType === 'LastCohorts') {
      await dispatch<any>(
        fetchCohorts({
          listType: 'FavoriteCohorts',
          sort: { sortBy: 'modified_at', sortDirection: 'desc' },
          filters: {
            status: [],
            favorite: 'True',
            minPatients: null,
            maxPatients: null,
            startDate: null,
            endDate: null
          },
          limit: 5
        })
      )

      await dispatch<any>(
        fetchCohorts({
          listType: 'LastCohorts',
          sort: { sortBy: 'modified_at', sortDirection: 'desc' },
          limit: 5
        })
      )
    }
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid id="research-card-title" item xs={9}>
          <Typography component="h2" variant="h2" color="primary" gutterBottom>
            {title}
          </Typography>
        </Grid>
        <Grid item container xs={3} justifyContent="flex-end">
          <Link className={classes.link} onClick={onClickLink}>
            {linkLabel}
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.tableContainer}>
        {loading ? (
          <Grid container item justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          <>
            {requests && <RequestsTable simplified={simplified} researchData={requests} />}
            {cohorts && (
              <ResearchTable
                simplified={simplified}
                researchData={cohorts}
                onDeleteCohort={onDeleteCohort}
                onSetCohortFavorite={onSetCohortFavorite}
                onClickRow={onClickRow}
                onUpdateCohorts={updateCohorts}
              />
            )}
          </>
        )}
      </Grid>
    </>
  )
}

export default ResearchCard
