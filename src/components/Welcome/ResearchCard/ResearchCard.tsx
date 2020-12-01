import React, { useState, useEffect } from 'react'

import { Grid, Link } from '@material-ui/core'

import Title from '../../Title'
import ResearchTable from '../../SavedResearch/ResearchTable/ResearchTable'

import { setFavorite } from '../../../services/savedResearches'
import { Back_API_Response, FormattedCohort } from 'types'

import useStyles from './styles'

type ResearchCardProps = {
  simplified?: boolean
  onClickRow?: (props: any) => void
  title?: string
  fetchCohort: () => Promise<Back_API_Response<FormattedCohort> | undefined>
}

const ResearchCard: React.FC<ResearchCardProps> = ({ onClickRow, simplified, title, fetchCohort }) => {
  const classes = useStyles()
  const [researches, setResearches] = useState<FormattedCohort[] | undefined>()

  const onDeleteCohort = async (cohortId: string) => {
    setResearches(researches?.filter((r) => r.researchId !== cohortId))
  }

  const onSetCohortFavorite = async (cohortId: string, favStatus: boolean) => {
    setFavorite(cohortId, favStatus)
      .then(() => fetchCohort())
      .then((cohortsResp) => {
        if (cohortsResp) {
          setResearches(cohortsResp.results)
        }
      })
  }

  useEffect(() => {
    fetchCohort().then((cohortsResp) => {
      if (cohortsResp) {
        setResearches(cohortsResp.results)
      }
    })
  }, []) // eslint-disable-line

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
          researchData={researches}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
        />
      </Grid>
    </>
  )
}

export default ResearchCard
