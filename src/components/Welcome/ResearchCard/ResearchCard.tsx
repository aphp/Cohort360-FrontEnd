import React from 'react'
import { Grid, Link, CircularProgress, Typography } from '@material-ui/core'

import ResearchTable from 'components/SavedResearch/ResearchTable/ResearchTable'
import RequestsTable from 'components/SavedResearch/ResearchTable/RequestsTable'

import { Cohort, RequestType } from 'types'
import { useAppDispatch } from 'state'
import { deleteCohort, setFavoriteCohort } from 'state/cohort'

import useStyles from './styles'

type ResearchCardProps = {
  isFav?: boolean
  simplified?: boolean
  onClickLink?: (props: any) => void
  onClickRow?: (props: any) => void
  title?: string
  linkLabel?: string
  cohorts?: Cohort[]
  requests?: RequestType[]
  loading?: boolean
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  onClickRow,
  onClickLink,
  simplified,
  title,
  linkLabel,
  cohorts,
  requests,
  loading
}) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const onDeleteCohort = async (cohort: Cohort) => {
    dispatch<any>(deleteCohort({ deletedCohort: cohort }))
  }

  const onSetCohortFavorite = (cohort: Cohort) => {
    dispatch<any>(setFavoriteCohort({ favCohort: cohort }))
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
          <Link underline="always" className={classes.link} onClick={onClickLink}>
            {linkLabel}
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.tableContainer}>
        {loading ? (
          <CircularProgress />
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
              />
            )}
          </>
        )}
      </Grid>
    </>
  )
}

export default ResearchCard
