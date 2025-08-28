import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Grid, CircularProgress } from '@mui/material'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import { getCleanGroupId } from 'utils/paginationUtils'
import { useCleanSearchParams } from 'components/ExplorationBoard/useCleanSearchParams'
import PageContainer from 'components/ui/PageContainer'
import servicesPatients from 'services/aphp/servicePatients'
import { Patient as PatientType } from 'types/exploration'
import PatientBoard from '../../components/Patient'

const Patient = () => {
  useCleanSearchParams()
  const [patient, setPatient] = useState<PatientType | null>(null)
  const [loading, setLoading] = useState(true)
  const groupId = getCleanGroupId(useSearchParams()[0].get('groupId'))
  const { patientId } = useParams<{ patientId?: string }>()

  useEffect(() => {
    const _fetchPatient = async () => {
      try {
        if (patientId) {
          const patient = await servicesPatients.fetchPatientInfo(patientId, groupId)
          setPatient(patient)
        }
      } finally {
        setLoading(false)
      }
    }
    setLoading(true)
    _fetchPatient()
  }, [patientId, groupId])

  if (patient === null && !loading) return <PatientNotExist />

  return (
    <PageContainer>
      {loading && (
        <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }} height="100vh">
          <CircularProgress size={50} />
        </Grid>
      )}
      {!loading && patient && <PatientBoard patient={patient} />}
    </PageContainer>
  )
}

export default Patient
