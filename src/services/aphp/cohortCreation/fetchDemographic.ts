import { DEMOGRAPHIC_GENDER } from '../../../constants'
import apiFhir from 'services/apiFhir'
import { cleanValueSet } from 'utils/cleanValueSet'

export const fetchGender = async () => {
  try {
    const res = await apiFhir.get<any>(`/ValueSet?url=${DEMOGRAPHIC_GENDER}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchStatus = async () => {
  return [
    {
      id: false,
      label: 'Vivant(e)'
    },
    {
      id: true,
      label: 'Décédé(e)'
    }
  ]
}
