import { AppConfig, getConfig, updateConfig } from 'config'
import { fetchFhirMetadata } from './callApi'

export const updateConfigFromFhirMetadata = async () => {
  const fhirConfig = await fetchFhirMetadata()
  const baseConfig = getConfig()
  const resourcesDefinition = fhirConfig.data?.rest?.[0]?.resource
  if (resourcesDefinition) {
    const defaultConfig: AppConfig = { ...baseConfig }
    const [computedConfig] = resourcesDefinition.reduce(
      (configAndState, resource) => {
        const updatedConfig = configAndState[0]
        const state = configAndState[1]
        if (resource.type === 'Patient' && resource.searchParam?.find((param) => param.name === 'facet')) {
          updatedConfig.core.fhir.facetsExtensions = true
        } else if (resource.type === 'Claim') {
          updatedConfig.features.claim.enabled = true
        } else if (resource.type === 'ImagingStudy') {
          updatedConfig.features.imaging.enabled = true
        } else if (resource.type === 'Condition') {
          updatedConfig.features.condition.enabled = true
        } else if (resource.type === 'DocumentReference') {
          updatedConfig.features.documentReference.enabled = true
        } else if (resource.type === 'MedicationAdministration') {
          updatedConfig.features.medication.enabled = true
        } else if (resource.type === 'MedicationRequest') {
          updatedConfig.features.medication.enabled = true
        } else if (resource.type === 'Observation') {
          updatedConfig.features.observation.enabled = true
        } else if (resource.type === 'Procedure') {
          updatedConfig.features.procedure.enabled = true
        } else if (resource.type === 'Questionnaire') {
          state.questionnaireResourceRequiredCount += 1
        } else if (resource.type === 'QuestionnaireResponse') {
          state.questionnaireResourceRequiredCount += 1
        }
        if (state.questionnaireResourceRequiredCount == 2) {
          updatedConfig.features.questionnaires.enabled = true
        }
        return [updatedConfig, state]
      },
      [defaultConfig, { questionnaireResourceRequiredCount: 0 }]
    )
    updateConfig(computedConfig)
  }
}
