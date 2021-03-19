import { IPractitioner } from '@ahryman40k/ts-fhir-types/lib/R4'

import api from './api'
import { FHIR_API_Response } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPractitioner = async (email: string) => {
  const respPractitioner = await api.get<FHIR_API_Response<IPractitioner>>(`/Practitioner?email=${email}`)
  const practitioner = getApiResponseResources(respPractitioner)?.[0]

  if (undefined === practitioner) {
    return
  }

  const firstName = practitioner.name?.[0].given?.join(' ') ?? ''
  const lastName = practitioner.name?.[0].family ?? ''
  const displayName = `${lastName} ${firstName}`
  const id = practitioner.id ?? ''
  return {
    id,
    email,
    displayName,
    firstName,
    lastName
  }
}
