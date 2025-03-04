import React, { useMemo } from 'react'
import { useAppSelector } from 'state'
import { Grid, Typography } from '@mui/material'
import useStyles from './styles'
import { ResourceType } from 'types/requestCriterias'
import ExplorationBoard from 'components/ExplorationBoard'
import { BlockWrapper } from 'components/ui/Layout'

const SearchPatient = () => {
  const { classes, cx } = useStyles()
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
      saveFilters: false
    }),
    []
  )
  return (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container justifyContent="center" alignItems="center">
        <BlockWrapper item xs={11} margin={'20px 0px'}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
        </BlockWrapper>
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
