import {
  ENCOUNTER_ADMISSION_MODE,
  ENCOUNTER_ENTRY_MODE,
  ENCOUNTER_EXIT_MODE,
  ENCOUNTER_VISIT_TYPE,
  ENCOUNTER_SEJOUR_TYPE,
  ENCOUNTER_FILE_STATUS,
  ENCOUNTER_EXIT_TYPE,
  ENCOUNTER_DESTINATION,
  ENCOUNTER_PROVENANCE,
  ENCOUNTER_ADMISSION
} from '../../../constants'
import apiRequest from 'services/apiRequest'
import { cleanValueSet } from 'utils/cleanValueSet'

export const fetchAdmissionModes = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ADMISSION_MODE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchEntryModes = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ENTRY_MODE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchExitModes = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_EXIT_MODE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchPriseEnChargeType = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_VISIT_TYPE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    const cleanData = cleanValueSet(data)

    return cleanData && cleanData.length > 0
      ? cleanData.filter((value: { id: string; label: string }) => {
          return !(value.id === 'nachstationär' || value.id === 'z.zt. verlegt')
        })
      : []
  } catch (error) {
    return []
  }
}

export const fetchTypeDeSejour = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_SEJOUR_TYPE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchFileStatus = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_FILE_STATUS}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchReason = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_EXIT_TYPE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchDestination = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_DESTINATION}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchProvenance = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_PROVENANCE}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchAdmission = async () => {
  try {
    const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ADMISSION}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}
