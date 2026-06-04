import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from 'state'

import { CohortPatient } from 'types'

import { AccessLevel } from 'components/ui/AccessBadge'
import Button from 'components/ui/Button'
import HeaderLayout from 'components/ui/Header'
import PatientInfo from './PatientInfo/PatientInfo'

import WestIcon from '@mui/icons-material/West'

import { capitalizeFirstLetter } from 'utils/string'
import { formatDate } from 'utils/dates'
import { getAge } from 'utils/age'

import { GenderStatus } from 'types/searchCriterias'
import { Patient, URLS } from 'types/exploration'
import { ScopeElement } from 'types/scope'
import { ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'

type PatientHeaderProps = {
  patient: Patient
  groupId?: string
}

const PatientHeader = ({ patient, groupId }: PatientHeaderProps) => {
  const appConfig = getConfig()
  const navigate = useNavigate()
  const { cohort, cohortId } = useAppSelector((state) => state.exploredCohort)
  const { deidentified, id, infos } = patient

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
  const age = getAge(infos as CohortPatient)
  const birthdate = formatDate(infos.birthDate)
  const firstName = infos.name?.[0].given?.[0]
  const lastName =
    infos.name
      ?.map((e) => {
        if (e.use === 'official') {
          return e.family ?? 'Non renseigné'
        }
        if (e.use === 'maiden') {
          return `(${infos.gender === 'female' ? 'née' : 'né'} : ${e.family})`
        }
      })
      .join(' ') ?? 'Non renseigné'

  const ipp = deidentified
    ? `${id ?? '-'}`
    : `${
        infos.identifier?.find(
          (identifier) =>
            identifier.type?.coding?.[0].code === appConfig.features.patient.patientIdentifierExtensionCode?.code &&
            identifier.type?.coding?.[0].system === appConfig.features.patient.patientIdentifierExtensionCode?.system
        )?.value ?? infos.identifier?.[0].value
      }`

  return (
    <HeaderLayout
      title={deidentified ? 'Information Patient' : `${capitalizeFirstLetter(firstName)} ${lastName}`}
      accessLevel={deidentified ? AccessLevel.DEIDENTIFIED : AccessLevel.NOMINATIVE}
      patientCard={
        <PatientInfo
          age={deidentified ? age : `${birthdate} (${age})`}
          ipp={ipp}
          gender={infos.gender as GenderStatus}
          deidentified={deidentified}
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
