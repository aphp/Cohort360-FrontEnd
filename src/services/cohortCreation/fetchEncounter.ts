import {
  CONTEXT,
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
} from '../../constants'
import apiRequest from '../apiRequest'
import {
  fakeAdmissionModes,
  fakeEntryModes,
  fakeExitModes,
  fakeFileStatus,
  fakePriseEnCharge,
  fakeTypeDeSejour
} from 'data/fakeData/cohortCreation/encounter'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { cleanValueSet } from 'utils/cleanValueSet'

export const fetchAdmissionModes = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeAdmissionModes && fakeAdmissionModes.length > 0
      ? fakeAdmissionModes.map((_fakeAdmissionModes: { code: string; display: string }) => ({
          id: _fakeAdmissionModes.code,
          label: capitalizeFirstLetter(_fakeAdmissionModes.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ADMISSION_MODE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []
      return data && data.length > 0
        ? data.map((_data: { code: string; display: string }) => ({
            id: _data.code,
            label: capitalizeFirstLetter(_data.display)
          }))
        : []
    } catch (error) {
      return []
    }
  }
}

export const fetchEntryModes = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeEntryModes && fakeEntryModes.length > 0
      ? fakeEntryModes.map((_fakeEntryModes: { code: string; display: string }) => ({
          id: _fakeEntryModes.code,
          label: capitalizeFirstLetter(_fakeEntryModes.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ENTRY_MODE}`)
      const data = res.data.entry[0].resource.compose.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchExitModes = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeExitModes && fakeExitModes.length > 0
      ? fakeExitModes.map((_fakeExitModes: { code: string; display: string }) => ({
          id: _fakeExitModes.code,
          label: capitalizeFirstLetter(_fakeExitModes.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_EXIT_MODE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchPriseEnChargeType = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakePriseEnCharge && fakePriseEnCharge.length > 0
      ? fakePriseEnCharge.map((_fakePriseEnCharge: { code: string; display: string }) => ({
          id: _fakePriseEnCharge.code,
          label: capitalizeFirstLetter(_fakePriseEnCharge.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_VISIT_TYPE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

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
}

export const fetchTypeDeSejour = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeTypeDeSejour && fakeTypeDeSejour.length > 0
      ? fakeTypeDeSejour.map((_fakeTypeDeSejour: { code: string; display: string }) => ({
          id: _fakeTypeDeSejour.code,
          label: capitalizeFirstLetter(_fakeTypeDeSejour.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_SEJOUR_TYPE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchFileStatus = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeFileStatus && fakeFileStatus.length > 0
      ? fakeFileStatus.map((_fakeFileStatus: { code: string; display: string }) => ({
          id: _fakeFileStatus.code,
          label: capitalizeFirstLetter(_fakeFileStatus.display)
        }))
      : []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_FILE_STATUS}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchReason = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_EXIT_TYPE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchDestination = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_DESTINATION}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchProvenance = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_PROVENANCE}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}

export const fetchAdmission = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${ENCOUNTER_ADMISSION}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      return cleanValueSet(data)
    } catch (error) {
      return []
    }
  }
}
