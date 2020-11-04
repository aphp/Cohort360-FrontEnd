import React from 'react'
import Title from '../../Title'
import { Grid, Link } from '@material-ui/core'
import useStyles from './style'

import ResearchTable from '../../SavedResearch/ResearchTable/ResearchTable'
import {
  fetchLastCohorts,
  setFavorite
} from '../../../services/savedResearches'

const LastResearch = ({ simplified, onClickRow, filteredIds }) => {
  const classes = useStyles()
  const [researches, setResearches] = React.useState([])

  const page = 1
  const researchLines = 5 // Number of desired lines in the document array

  const onDeleteCohort = async (cohortId) => {
    setResearches(researches.filter((r) => r.researchId !== cohortId))
  }

  const onSetCohortFavorite = async (cohortId, favStatus) => {
    setFavorite(cohortId, favStatus)
      .then(() => fetchLastCohorts())
      .then(({ formattedCohort }) => {
        setResearches(formattedCohort)
      })
  }

  React.useEffect(() => {
    fetchLastCohorts().then(({ formattedCohort }) => {
      setResearches(formattedCohort)
    })
  }, [])

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          <Title>Mes dernières cohortes créées</Title>
        </Grid>
        <Grid item container xs={3} justify="flex-end">
          <Link
            underline="always"
            className={classes.link}
            href="/recherche_sauvegarde"
          >
            Voir toutes mes cohortes
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.tableContainer}>
        <ResearchTable
          simplified={simplified}
          researchLines={researchLines}
          researchData={researches}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
          page={page}
        />
      </Grid>
    </React.Fragment>
  )
}

export default LastResearch
