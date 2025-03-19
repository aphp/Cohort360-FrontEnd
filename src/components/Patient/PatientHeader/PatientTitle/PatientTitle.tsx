import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from 'state'

import { IconButton, Grid, Menu, MenuItem, Typography } from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'
import { ResourceType } from 'types/requestCriterias'
import { URLS } from 'types/exploration'

type PatientTitleProps = {
  firstName: string | undefined
  lastName: string | (string | undefined)[] | undefined
}
const PatientTitle: React.FC<PatientTitleProps> = ({ firstName, lastName }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? undefined

  const cohort = useAppSelector((state) => state.exploredCohort)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuClose = () => setAnchorEl(null)

  const goBacktoCohort = () => {
    const path =
      cohort.cohortId && groupId === cohort.cohortId
        ? `/${URLS.COHORT}/${ResourceType.PATIENT}?groupId=${cohort.cohortId}`
        : groupId && groupId !== cohort.cohortId
        ? `/${URLS.PERIMETERS}/${ResourceType.PATIENT}?groupId=${groupId}`
        : `/${URLS.PATIENTS}/${ResourceType.PATIENT}`
    navigate(path)
  }

  return (
    <Grid container alignItems="center" className={classes.root}>
      <IconButton onClick={() => goBacktoCohort()}>
        <ArrowBackIcon className={classes.iconButtons} />
      </IconButton>
      <Typography variant="h2" color="primary" className={classes.patientName}>
        {capitalizeFirstLetter(firstName) ?? ''} {lastName ?? ''}
      </Typography>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Inclure dans une cohorte</MenuItem>
        <MenuItem onClick={handleMenuClose}>Exclure d&apos;une cohorte</MenuItem>
      </Menu>
    </Grid>
  )
}

export default PatientTitle
