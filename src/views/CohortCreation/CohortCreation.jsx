import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import TopBar from '../../components/TopBar/TopBar'
// import InclusionDiagram from '../../components/Cohort/InclusionDiagram/InclusionDiagram'
import Requeteur from './../../components/Cohort/CreationCohort/Requeteur'
import useStyles from './styles'

import api from '../../services/api'

const fetchPatientNumber = async () => {
  const response = await api.get('Patient?_summary=count')
  if (!response) return 0

  return response.data ? response.data.total : 0
}

const CohortCreation = () => {
  const open = useSelector((state) => state.drawer)
  const classes = useStyles()

  const [patientNb, setPatientNb] = useState(undefined)

  const _fetchPatientNumber = async () => {
    const patientNumber = await fetchPatientNumber()
    setPatientNb(patientNumber)
  }

  useEffect(() => {
    _fetchPatientNumber()
  }, [])

  return (
    <div position="fixed" className={clsx(classes.appBar, { [classes.appBarShift]: open })}>
      <TopBar status="Création de cohorte" patientsNb={patientNb} access="Nominatif" fav save />
      <div className={classes.mainContainer}>
        <Requeteur />
      </div>
    </div>
  )
}

export default CohortCreation
