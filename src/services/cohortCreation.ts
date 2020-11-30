import api from './apiRequest'
import { CONTEXT } from '../constants'

import { Cohort_Count_API_Response, Cohort_Creation_API_Response } from 'types'

export const countCohort = async (requeteurJson: string) => {
  if (!requeteurJson) return null

  if (CONTEXT === 'arkhn') {
    // const request: Cohort_Count_API_Response = await api.post('QueryServer/api/count', requeteurJson)
    // const { data } = request
    return null
  } else {
    const request: Cohort_Count_API_Response = (await api.post('QueryServer/api/count', requeteurJson)) || {}
    const { data } = request
    return data ? data.result && data.result[0] : null
  }
}

export const createCohort = async (requeteurJson: string) => {
  if (!requeteurJson) return null

  if (CONTEXT === 'arkhn') {
    // const request: Cohort_Creation_API_Response = await api.post('QueryServer/api/count', requeteurJson)
    // const { data } = request
    return null
  } else {
    const request: Cohort_Creation_API_Response = (await api.post('QueryServer/api/create', requeteurJson)) || {}
    const { data } = request
    return data ? data.result && data.result[0] : null
  }
}
