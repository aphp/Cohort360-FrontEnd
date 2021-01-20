import apiRequest from '../apiRequest'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchAdmissionModes = async () => {
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

export const fetchEntryModes = async () => {
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

export const fetchExitModes = async () => {
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

export const fetchFileStatus = async () => {
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
