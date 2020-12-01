import api from './api'

import { CONTEXT } from '../constants'
import { FHIR_API_Response } from 'types'
import {
  IPractitioner
  // IObservation
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchPractitioner = async (username: string) => {
  if (CONTEXT === 'aphp') {
    const practitioner = await api.get(`/Practitioner?identifier=${username}`)
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
    //TODO: Keep it for later ?

    // const patientIds: string[] | undefined = getApiResponseResources(
    //   respObservation
    // )
    //   ?.map((obs) => obs.subject?.reference?.split('/')[1])
    //   .filter((s): s is string => undefined !== s)

    // const respPatients = await Promise.all(
    //   patientIds
    //     ? patientIds.map((id: string) => api.get<FHIR_API_Response<IPatient>>(`/Patient?id=${id}`))
    //     : []
    // )
    // const practitionerPatients = respPatients.map(
    //   (resp) => resp.data.entry[0].resource
    // )

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
