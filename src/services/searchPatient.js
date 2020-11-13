import api from './api'
import { CONTEXT } from '../constants'
import { getLastEncounter } from './myPatients'

export const searchPatient = async (input, searchBy) => {
  const patientSet = new Set()

  if (CONTEXT === 'arkhn') {
    const matchIPP = await api.get(`/Patient?identifier.value=${input}`)
    matchIPP.data.entry.forEach((item) =>
      item.resource.issue ? null : patientSet.add(item.resource)
    )

    const matchFamily = await api.get(`/Patient?name.family=${input}`)
    matchFamily.data.entry.forEach((item) =>
      item.resource.issue ? null : patientSet.add(item.resource)
    )

    const matchGiven = await api.get(`/Patient?name.given=${input}`)
    matchGiven.data.entry.forEach((item) =>
      item.resource.issue ? null : patientSet.add(item.resource)
    )

    return [...patientSet].filter(Boolean)
  } else if (CONTEXT === 'aphp') {
    const patientList = await api.get(
      `/Patient?${searchBy}=${input}&_elements=gender,name,birthDate,deceasedBoolean,identifier,extension`
    )
    if (!patientList.data.total) {
      return 0
    } else {
      if (patientList.data.entry) {
        patientList.data.entry.forEach((item) => patientSet.add(item.resource))
      } else {
        return 0
      }
    }

    return await getLastEncounter([...patientSet].filter(Boolean))
  }
}
