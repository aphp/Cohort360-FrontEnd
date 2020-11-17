import apiRequest from './apiRequest'

const fetchEntryModes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-visit_mode entree`)
  return res.data.entry[0].resource.compose.include[0].concept
}

export default fetchEntryModes
