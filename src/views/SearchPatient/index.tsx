import React, { useMemo } from 'react'
import { useAppSelector } from 'state'
import { Grid } from '@mui/material'
import { ResourceType } from 'types/requestCriterias'
import ExplorationBoard from 'components/ExplorationBoard'
import sideBarTransition from 'styles/sideBarTransition'
import { useParams } from 'react-router-dom'
import { buildExplorationConfig } from 'components/ExplorationBoard/config/config'
import HeaderLayout from 'components/ui/Header'

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
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, { [classes.appBarShift]: open })}
      sx={{ backgroundColor: '#FFF' }}
    >
      <HeaderLayout title="Rechercher un patient" />
      <Grid container justifyContent="center">
        <Grid container xs={11}>
          {config && <ExplorationBoard config={config} />}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchPatient
