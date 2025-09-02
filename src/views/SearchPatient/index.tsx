import React, { useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from 'state'
import { Grid } from '@mui/material'
import { ResourceType } from 'types/requestCriterias'
import ExplorationBoard from 'components/ExplorationBoard'
import { useParams } from 'react-router-dom'
import { buildExplorationConfig } from 'components/ExplorationBoard/config/config'
import HeaderLayout from 'components/ui/Header'
import PageContainer from 'components/ui/PageContainer'
import { resetState } from 'state/exploredCohort'

const DISPLAY_OPTIONS = {
  myFilters: false,
  filterBy: false,
  criterias: false,
  search: true,
  diagrams: false,
  count: false,
  orderBy: false,
  saveFilters: false,
  sidebar: false
}

const SearchPatient = () => {
  const practitioner = useAppSelector((state) => state.me)
  const dispatch = useAppDispatch()
  const { search } = useParams<{ search: string }>()

  const config = useMemo(
    () =>
      buildExplorationConfig(false, null, practitioner?.nominativeGroupsIds ?? []).get(
        ResourceType.PATIENT,
        DISPLAY_OPTIONS,
        search
      ),
    [practitioner, search]
  )

  useEffect(() => {
    dispatch(resetState())
  }, [])

  return (
    <PageContainer>
      <HeaderLayout title="Rechercher un patient" titleOnly />
      <Grid container justifyContent="center">
        <Grid container xs={11} mt={1}>
          {config && <ExplorationBoard config={config} />}
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default SearchPatient
