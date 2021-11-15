import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { CONTEXT } from '../../../../constants'
import { useAppSelector } from 'state'

import { IconButton, Grid, Menu, MenuItem, Typography } from '@material-ui/core'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { ReactComponent as MoreIcon } from 'assets/icones/ellipsis-v.svg'

import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'

type PatientTitleProps = {
  firstName: string | undefined
  lastName: string | undefined
}
const PatientTitle: React.FC<PatientTitleProps> = ({ firstName, lastName }) => {
  const classes = useStyles()
  const history = useHistory()

  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? undefined

  const { cohort } = useAppSelector((state) => ({
    cohort: state.exploredCohort
  }))
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const goBacktoCohort = () => {
    const path =
      Array.isArray(cohort.cohort) && cohort.cohort.length > 0
        ? `/perimetres/patients?${cohort.cohort.map((e: any) => e.id).join()}`
        : !Array.isArray(cohort.cohort) && cohort.cohort?.id
        ? `/cohort/${cohort.cohort?.id}/patients`
        : groupId
        ? `/perimetres/patients?${groupId}`
        : '/mes_patients/patients'

    history.push(path)
  }

  return (
    <Grid container alignItems="center" className={classes.root}>
      <IconButton onClick={() => goBacktoCohort()}>
        <ArrowBackIcon className={classes.iconButtons} />
      </IconButton>
      <Typography variant="h2" color="primary" className={classes.patientName}>
        {capitalizeFirstLetter(firstName) ?? ''} {lastName ?? ''}
      </Typography>
      {CONTEXT === 'arkhn' && (
        <IconButton onClick={handleMenuOpen}>
          <MoreIcon className={classes.iconButtons} fill="#5BC5F2" />
        </IconButton>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Inclure dans une cohorte</MenuItem>
        <MenuItem onClick={handleMenuClose}>Exclure d&apos;une cohorte</MenuItem>
      </Menu>
    </Grid>
  )
}

export default PatientTitle
