import { CONTEXT, DEMOGRAPHIC_GENDER } from '../../constants'
import apiRequest from '../apiRequest'
import { cleanValueSet } from 'utils/cleanValueSet'

export const fetchGender = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    const res = [
      {
        id: 'm',
        label: 'Homme'
      },
      {
        id: 'f',
        label: 'Femme'
      },
      {
        id: 'o',
        label: 'Autre'
      },
      {
        id: 'i',
        label: 'Indeterminé.e'
      }
    ]
    return res
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${DEMOGRAPHIC_GENDER}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      if (data && data.length > 0) {
        return cleanValueSet(data)
      } else {
        return []
      }
    } catch (error) {
      return []
    }
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
