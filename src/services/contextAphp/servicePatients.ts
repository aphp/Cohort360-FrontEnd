// import moment from 'moment'

// import { getInfos } from '../myPatients'
// import {
//   CohortData,
//   SearchByTypes,
//   VitalStatus,
//   Back_API_Response,
//   Cohort,
//   AgeRepartitionType,
//   GenderRepartitionType
// } from 'types'
// import { IPatient, IComposition, IComposition_Section, PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
// import {
//   getGenderRepartitionMapAphp,
//   getEncounterRepartitionMapAphp,
//   getAgeRepartitionMapAphp,
//   getVisitRepartitionMapAphp
// } from 'utils/graphUtils'
// import { getApiResponseResources } from 'utils/apiHelpers'

// import { fetchGroup, fetchPatient, fetchEncounter, fetchComposition, fetchCompositionContent } from './callApi'
// import apiBackend from '../apiBackend'

export interface IServicesPatients {
  getPatientInfos: () => null
  fetchMyPatients: () => null
  getEncounterInfos: () => null
  getInfos: () => null
}

const servicesPatients: IServicesPatients = {
  getPatientInfos: () => {
    return null
  },
  fetchMyPatients: () => {
    return null
  },
  getEncounterInfos: () => {
    return null
  },
  getInfos: () => {
    return null
  }
}

export default servicesPatients
