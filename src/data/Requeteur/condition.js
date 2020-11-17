import apiRequest from './apiRequest'

export const fetchCode = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-gender`)
  return res.data.entry[0].resource.compose.include[0].concept
}
