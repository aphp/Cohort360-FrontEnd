import api from '../apiFhir'

import { CONTEXT } from '../../constants'
import { FHIR_API_Response } from 'types'
import {
  IPractitioner
  // IObservation
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPractitioner = async (username: string) => {
  if (CONTEXT === 'fakedata') {
    const id = 12
    const userName = 707070
    const firstName = 'John'
    const lastName = 'Snow'
    const displayName = `${lastName} ${firstName}`

    return {
      id,
      userName,
      displayName,
      firstName,
      lastName
    }
  }
  if (CONTEXT === 'aphp') {
    const practitioner = await api.get<any>(`/Practitioner?identifier=${username}`)
    if (
      !practitioner ||
      (practitioner && !practitioner.data) ||
      (practitioner && practitioner.data && !practitioner.data.entry)
    )
      return

    const { resource } = practitioner.data.entry[0]
    const id = resource.id
    const userName = resource.identifier[0].value
    const firstName = resource.name[0].given.join(' ')
    const lastName = resource.name[0].family
    const displayName = `${lastName} ${firstName}`

    return {
      id,
      userName,
      displayName,
      firstName,
      lastName
    }
  } else if (CONTEXT === 'arkhn') {
    // FIX ME PLEASSSSSSE
    const practitionerId = '14332'
    const [respPractitioner /* respObservation */] = await Promise.all([
      api.get<FHIR_API_Response<IPractitioner>>(`/Practitioner?identifier=${practitionerId}`)
      // api.get<FHIR_API_Response<IObservation>>(
      //   `/Observation?performer:identifier=${practitionerId}`
      // )
    ])
    const practitioner = getApiResponseResources(respPractitioner)?.[0]
    if (undefined === practitioner) {
      return
    }

    const userName = practitioner.identifier?.[0].value ?? ''
    const firstName = practitioner.name?.[0].given?.join(' ') ?? ''
    const lastName = practitioner.name?.[0].family ?? ''
    const displayName = practitioner.text?.div ?? `${lastName} ${firstName}`
    return {
      id: practitionerId,
      userName,
      displayName,
      firstName,
      lastName
    }
  }
}

export const fetchPractitionerRole = async (practitionerId: string) => {
  if (CONTEXT === 'aphp') {
    const practitionerRole = await api.get<any>(
      `PractitionerRole?practitioner=${practitionerId}&_elements=organization,extension`
    )

    if (
      !practitionerRole ||
      (practitionerRole && !practitionerRole.data) ||
      (practitionerRole && practitionerRole.data && !practitionerRole.data.entry)
    )
      return undefined

    const { resource } = practitionerRole.data.entry[0]
    return resource
  }
}
