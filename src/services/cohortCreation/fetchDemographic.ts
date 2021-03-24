import { CONTEXT } from '../../constants'
import apiRequest from '../apiRequest'
import { capitalizeFirstLetter } from '../../utils/capitalize'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'

type Gender = {
  id: PatientGenderKind
  label: string
}

export const fetchGender = async (): Promise<Gender[]> => {
  if (CONTEXT === 'aphp') {
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
  } else {
    return [
      {
        id: PatientGenderKind._male,
        label: 'Homme'
      },
      {
        id: PatientGenderKind._female,
        label: 'Femme'
      },
      {
        id: PatientGenderKind._other,
        label: 'Autre'
      },
      {
        id: PatientGenderKind._unknown,
        label: 'Indeterminé.e'
      }
    ]
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
