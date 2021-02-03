import { CONTEXT } from '../../constants'
import apiRequest from '../apiRequest'
import {
  fakeAdmissionModes,
  fakeEntryModes,
  fakeExitModes,
  fakeFileStatus
} from '.././../data/fakeData/cohortCreation/encounter'
import { capitalizeFirstLetter } from '../../utils/capitalize'

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
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_type`)
      const data = res.data.entry[0].resource.compose.include[0].concept || []
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
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode entree`)
      const data = res.data.entry[0].resource.compose.include[0].concept || []
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
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode sortie`)
      const data = res.data.entry[0].resource.compose.include[0].concept || []
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
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visite-status`)
      const data = res.data.entry[0].resource.compose.include[0].concept || []
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
