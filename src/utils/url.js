export const getInclusionCriteriaUrl = (inclusionCriteria, index) => {
  switch (inclusionCriteria.type) {
    case 'Document médical':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/medicalDoc/${index}`
    case 'Démographie patient':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/patientDemography/${index}`
    case 'Diagnostic CIM':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/cimDiagnostic/${index}`
    default:
      return ''
  }
}
