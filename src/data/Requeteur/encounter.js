import apiRequest from './apiRequest'

export const fetchAdmissionModes = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_type`)
    return res.data.entry[0].resource.compose.include[0].concept || []
  } catch (error) {
    return []
  }
}

export const fetchEntryModes = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode entree`)
    return res.data.entry[0].resource.compose.include[0].concept || []
  } catch (error) {
    return []
  }
}

export const fetchExitModes = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode sortie`)
    return res.data.entry[0].resource.compose.include[0].concept || []
  } catch (error) {
    return []
  }
}

export const fetchFileStatus = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visite-status`)
    return res.data.entry[0].resource.compose.include[0].concept || []
  } catch (error) {
    return []
  }
}
