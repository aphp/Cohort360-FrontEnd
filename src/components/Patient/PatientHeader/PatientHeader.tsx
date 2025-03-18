import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from 'state'

import { CohortPatient, IPatientDetails } from 'types'

import { AccessLevel } from 'components/ui/AccessBadge'
import Button from 'components/ui/Button'
import HeaderLayout from 'components/ui/Header'
import PatientInfo from './PatientInfo/PatientInfo'

import WestIcon from '@mui/icons-material/West'

import { capitalizeFirstLetter } from 'utils/capitalize'
import { formatDate } from 'utils/formatDate'
import { getAge } from 'utils/age'

import { GenderStatus } from 'types/searchCriterias'
import { URLS } from 'types/exploration'
import { ScopeElement } from 'types/scope'
import { ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'

type PatientHeaderProps = {
  loading: boolean
  patient?: IPatientDetails
  deidentifiedBoolean: boolean
  groupId?: string
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
  loading,
  patient = { resourceType: 'Patient' },
  deidentifiedBoolean,
  groupId
}) => {
  const appConfig = getConfig()
  const navigate = useNavigate()
  const { cohort, cohortId } = useAppSelector((state) => state.exploredCohort)

  const goBackToExploredCohort = () => {
    const returnTo = {
      pathname: '',
      label: ''
    }
    if (!cohortId && !cohort) {
      returnTo.pathname = `/${URLS.PATIENTS}/${ResourceType.PATIENT}`
      returnTo.label = 'Retour vers tous mes patients'
    } else if (cohort && (cohort as ScopeElement[]).length > 0 && !cohortId) {
      returnTo.pathname = `/${URLS.PERIMETERS}/${ResourceType.PATIENT}?groupId=${groupId}`
      returnTo.label = "Retour vers l'exploration de périmètres"
    } else if (cohortId) {
      returnTo.pathname = `/${URLS.COHORT}/${ResourceType.PATIENT}?groupId=${groupId}`
      returnTo.label = 'Retour vers la cohorte'
    }

    return returnTo
  }

  const goBackButtonInfo = goBackToExploredCohort()
  const age = getAge(patient as CohortPatient)
  const birthdate = formatDate(patient.birthDate)
  const firstName = patient.name?.[0].given?.[0]
  const lastName =
    patient.name
      ?.map((e) => {
        if (e.use === 'official') {
          return e.family ?? 'Non renseigné'
        }
        if (e.use === 'maiden') {
          return `(${patient.gender === 'female' ? 'née' : 'né'} : ${e.family})`
        }
      })
      .join(' ') ?? 'Non renseigné'

  const ipp = deidentifiedBoolean
    ? `${patient.id ?? '-'}`
    : `${
        patient.identifier?.find(
          (identifier) =>
            identifier.type?.coding?.[0].code === appConfig.features.patient.patientIdentifierExtensionCode?.code &&
            identifier.type?.coding?.[0].system === appConfig.features.patient.patientIdentifierExtensionCode?.system
        )?.value ?? patient.identifier?.[0].value
      }`

  return (
    <HeaderLayout
      title={deidentifiedBoolean ? 'Information Patient' : `${capitalizeFirstLetter(firstName)} ${lastName}`}
      accessLevel={deidentifiedBoolean ? AccessLevel.DEIDENTIFIED : AccessLevel.NOMINATIVE}
      loading={loading}
      patientCard={
        <PatientInfo
          age={deidentifiedBoolean ? age : `${birthdate} (${age})`}
          ipp={ipp}
          gender={patient.gender as GenderStatus}
          deidentified={deidentifiedBoolean}
        />
      }
      goBackButton={
        <Button
          startIcon={<WestIcon />}
          customVariant="back"
          width="fit-content"
          onClick={() => navigate(goBackButtonInfo.pathname)}
        >
          {goBackButtonInfo.label}
        </Button>
      }
    />
  )
}

export default PatientHeader
