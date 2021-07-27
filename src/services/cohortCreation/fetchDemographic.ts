import { CONTEXT } from '../../constants'
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
      const res = await apiRequest.get(`/ValueSet?url=http://hl7.org/fhir/CodeSystem/administrative-gender`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      if (data && data.length > 0) {
        data.forEach((value: { code: string; display: string }) => {
          switch (value.code) {
            case 'female':
              value.display = 'Femmes'
              break
            case 'male':
              value.display = 'Hommes'
              break
            case 'other':
              value.display = 'Autres'
              break
            case 'unknown':
              value.display = 'Non renseigné'
              break
            default:
              value.display = 'Indéterminé'
              break
          }
        })

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
