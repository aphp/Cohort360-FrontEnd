import services from '.'

export const fetchModalities = async () => {
  try {
    const modalities = await services.cohortCreation.fetchModalities()
    return modalities
  } catch (e) {
    return []
  }
}
