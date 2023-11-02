import services from '.'

export const fetchDiagnosticTypes = async () => {
  try {
    const diagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
    return diagnosticTypes
  } catch (e) {
    return []
  }
}
