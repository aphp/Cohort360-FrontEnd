import React, { useMemo } from 'react'
import { useAppSelector } from 'state'
import { Grid } from '@mui/material'
import { ResourceType } from 'types/requestCriterias'
import ExplorationBoard from 'components/ExplorationBoard'
import HeaderPage from 'components/ui/HeaderPage'
import sideBarTransition from 'styles/sideBarTransition'
import { useParams } from 'react-router-dom'
import { buildExplorationConfig } from 'components/ExplorationBoard/config/config'

const DISPLAY_OPTIONS = {
  myFilters: false,
  filterBy: false,
  criterias: false,
  search: true,
  diagrams: false,
  count: false,
  orderBy: false,
  saveFilters: false
}

const SearchPatient = () => {
  const { classes, cx } = sideBarTransition()
  const open = useAppSelector((state) => state.drawer)
  const practitioner = useAppSelector((state) => state.me)
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

  return (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={11}>
          <HeaderPage title="Rechercher un patient" id="patient-search" />
        </Grid>
        {config && <ExplorationBoard config={config} />}
      </Grid>
    </Grid>
  )
}

export default SearchPatient
