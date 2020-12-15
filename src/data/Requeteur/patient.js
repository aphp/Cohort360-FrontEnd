import apiRequest from '../../services/apiRequest'

export const fetchGender = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-gender`)
    return res.data.entry[0].resource.compose.include[0].concept || []
  } catch (error) {
    return []
  }
}

export const fetchStatus = async () => {
  const res = [
    {
      id: 0,
      value: false,
      display: 'Vivant(e)'
    },
    {
      id: 1,
      value: true,
      display: 'Décédé(e)'
    }
  ]
  return res
}
