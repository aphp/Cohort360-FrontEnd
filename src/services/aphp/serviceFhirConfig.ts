import { AppConfig, getConfig, ResourceFeatureConfig, updateConfig } from 'config'
import { fetchFhirMetadata } from './callApi'
import { CapabilityStatementRestResource } from 'fhir/r4'
import { ResourceType } from 'types/requestCriterias'

const enableAndConfigureResource = <T extends keyof AppConfig['features']>(
  resourceType: T,
  resourceConfig: CapabilityStatementRestResource,
  config: AppConfig
): ResourceFeatureConfig => {
  const featureConfig = config.features[resourceType] as ResourceFeatureConfig
  featureConfig.enabled = true
  featureConfig.fhir.searchParams = resourceConfig.searchParam?.map((param) => param.name) || []
  return featureConfig
}

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
        if (resource.type === 'Patient') {
          enableAndConfigureResource('patient', resource, updatedConfig)
          if (resource.searchParam?.find((param) => param.name === 'facet')) {
            updatedConfig.core.fhir.facetsExtensions = true
          }
        } else if (resource.type === 'Encounter') {
          enableAndConfigureResource('encounter', resource, updatedConfig)
        } else if (resource.type === 'Claim') {
          enableAndConfigureResource('claim', resource, updatedConfig)
        } else if (resource.type === 'ImagingStudy') {
          enableAndConfigureResource('imaging', resource, updatedConfig)
        } else if (resource.type === 'Condition') {
          enableAndConfigureResource('condition', resource, updatedConfig)
        } else if (resource.type === 'DocumentReference') {
          enableAndConfigureResource('documentReference', resource, updatedConfig)
        } else if (resource.type === 'MedicationAdministration') {
          updatedConfig.features.medication.enabled = true
          updatedConfig.features.medication.fhir.searchParams =
            updatedConfig.features.medication.fhir.searchParams.concat(
              resource.searchParam?.map((param) => param.name) || []
            )
        } else if (resource.type === 'MedicationRequest') {
          updatedConfig.features.medication.enabled = true
          updatedConfig.features.medication.fhir.searchParams =
            updatedConfig.features.medication.fhir.searchParams.concat(
              resource.searchParam?.map((param) => param.name) || []
            )
        } else if (resource.type === 'Observation') {
          enableAndConfigureResource('observation', resource, updatedConfig)
        } else if (resource.type === 'Procedure') {
          enableAndConfigureResource('procedure', resource, updatedConfig)
        } else if (resource.type === 'Questionnaire') {
          state.questionnaireResourceRequiredCount += 1
        } else if (resource.type === 'QuestionnaireResponse') {
          state.questionnaireResourceRequiredCount += 1
        } else if (resource.type === 'ValueSet') {
          updatedConfig.core.fhir.valuesetExpansion = true
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

export const hasSearchParam = (resourceType: ResourceType, searchParam: string, appConfig?: AppConfig) => {
  const config = appConfig || getConfig()
  const resourceTypeMapping: Partial<Record<ResourceType, keyof AppConfig['features']>> = {
    [ResourceType.PATIENT]: 'patient',
    [ResourceType.ENCOUNTER]: 'encounter',
    [ResourceType.CLAIM]: 'claim',
    [ResourceType.IMAGING]: 'imaging',
    [ResourceType.CONDITION]: 'condition',
    [ResourceType.DOCUMENTS]: 'documentReference',
    [ResourceType.MEDICATION_ADMINISTRATION]: 'medication',
    [ResourceType.MEDICATION_REQUEST]: 'medication',
    [ResourceType.OBSERVATION]: 'observation',
    [ResourceType.PROCEDURE]: 'procedure',
    [ResourceType.QUESTIONNAIRE_RESPONSE]: 'questionnaires'
  }
  const resourceTypeConfigName = resourceTypeMapping[resourceType]
  if (!resourceTypeConfigName) {
    return false
  }
  return (config.features[resourceTypeConfigName] as ResourceFeatureConfig).fhir.searchParams.includes(searchParam)
}
