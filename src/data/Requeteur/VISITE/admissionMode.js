import apiRequest from './apiRequest'

export const fetchAdmissionModes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_type`)
  return res.data.entry[0].resource.compose.include[0].concept
}

export const fetchEntryModes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode entree`)
  return res.data.entry[0].resource.compose.include[0].concept
}

export const fetchExitModes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode sortie`)
  return res.data.entry[0].resource.compose.include[0].concept
}

export const fetchFileStatus = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visite-status`)
  return res.data.entry[0].resource.compose.include[0].concept
}
