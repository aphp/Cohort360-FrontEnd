import apiRequest from './apiRequest'

export const fetchAdmissionModes = async () => {
  const resp = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_type`)
  return resp.data.entry[0].resource.compose.include[0].concept
}
