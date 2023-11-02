import services from '.'

export const fetchAdministrations = async () => {
  try {
    const result = services.cohortCreation.fetchAdministrations()
    return result
  } catch (e) {
    return []
  }
}

export const fetchPrescriptions = async () => {
  try {
    const prescriptions = await services.cohortCreation.fetchPrescriptionTypes()
    return prescriptions
  } catch (e) {
    return []
  }
}
