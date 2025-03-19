import React, { useMemo } from 'react'
import { useAppSelector } from 'state'
import { Grid } from '@mui/material'
import { ResourceType } from 'types/requestCriterias'
import ExplorationBoard from 'components/ExplorationBoard'
import { DATA_DISPLAY } from 'types/exploration'
import HeaderPage from 'components/ui/HeaderPage'
import sideBarTransition from 'styles/sideBarTransition'

const SearchPatient = () => {
  const { classes, cx } = sideBarTransition()
  const open = useAppSelector((state) => state.drawer)
  const practitioner = useAppSelector((state) => state.me)
  const nominativeGroupsIds = practitioner?.nominativeGroupsIds ?? []
  const displayOptions = useMemo(
    () => ({
      myFilters: false,
      filterBy: false,
      criterias: false,
      search: true,
      diagrams: false,
      count: false,
      orderBy: false,
      saveFilters: false,
      display: DATA_DISPLAY.TABLE
    }),
    []
  )
  return (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={11}>
          <HeaderPage title="Rechercher un patient" id="patient-search" />
        </Grid>
        <ExplorationBoard
          deidentified={false}
          groupId={nominativeGroupsIds}
          type={ResourceType.PATIENT}
          displayOptions={displayOptions}
        />
      </Grid>
    </Grid>
  )
}

export default SearchPatient
