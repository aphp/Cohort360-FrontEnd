import apiRequest from '../apiRequest'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchGender = async () => {
  try {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-gender`)
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

export const fetchStatus = async () => {
  const res = [
    {
      id: false,
      label: 'Vivant(e)'
    },
    {
      id: true,
      label: 'Décédé(e)'
    }
  ]
  return res
}
