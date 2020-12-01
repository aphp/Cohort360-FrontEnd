import api from './api'
import { CONTEXT } from '../constants'
import { FHIR_API_Response } from 'types'
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'

const fetchDeidentified = async (): Promise<boolean | undefined> => {
  if (CONTEXT === 'arkhn') {
    return false
  }
  if (CONTEXT === 'aphp') {
    const patientResp = await api.get<FHIR_API_Response<IPatient>>('/Patient?size=1&_elements=extension')

    const deidentification =
      patientResp.data.resourceType === 'Bundle'
        ? patientResp.data.entry?.[0].resource?.extension?.find((extension) => extension.url === 'deidentified')
            ?.valueBoolean
        : true

    return deidentification
  }
}

export { fetchDeidentified }
