import { getConfig } from 'config'
import {
  initPatientsSearchCriterias,
  initDocsSearchCriterias,
  initBioSearchCriterias,
  initPmsiSearchCriterias,
  initMedSearchCriterias,
  initFormsCriterias,
  initImagingCriterias
} from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'
import {
  fetchPatientList,
  fetchFormsList,
  fetchPMSIList,
  fetchDocumentsList,
  fetchMedicationList,
  fetchImagingList,
  fetchBiologyList
} from 'services/aphp/serviceExploration'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { AdditionalInfo, Data, ResourceOptions } from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import {
  SearchCriterias,
  Filters,
  FormNames,
  searchByListPatients,
  orderByListPatientsDeidentified,
  orderByListPatients,
  searchByListDocuments
} from 'types/searchCriterias'
import { Reference } from 'types/valueSet'
import { getFormLabel } from 'utils/formUtils'
import { getValueSetsFromSystems } from 'utils/valueSets'

export const getExplorationFetcher = (
  resourceType: ResourceType
): ((options: ResourceOptions<any>, signal?: AbortSignal) => Promise<Data>) => {
  const fetcherMap: Partial<
    Record<ResourceType, (options: ResourceOptions<any>, signal?: AbortSignal) => Promise<Data>>
  > = {
    [ResourceType.PATIENT]: fetchPatientList,
    [ResourceType.QUESTIONNAIRE_RESPONSE]: fetchFormsList,
    [ResourceType.CONDITION]: fetchPMSIList,
    [ResourceType.CLAIM]: fetchPMSIList,
    [ResourceType.PROCEDURE]: fetchPMSIList,
    [ResourceType.DOCUMENTS]: fetchDocumentsList,
    [ResourceType.MEDICATION_ADMINISTRATION]: fetchMedicationList,
    [ResourceType.MEDICATION_REQUEST]: fetchMedicationList,
    [ResourceType.IMAGING]: fetchImagingList,
    [ResourceType.OBSERVATION]: fetchBiologyList
  }
  return fetcherMap[resourceType] ?? fetchPatientList
}

export const getSourceType = (type: ResourceType) => {
  const sourceMap: Partial<Record<ResourceType, SourceType>> = {
    [ResourceType.DOCUMENTS]: SourceType.DOCUMENT,
    [ResourceType.CONDITION]: SourceType.CIM10,
    [ResourceType.PROCEDURE]: SourceType.CCAM,
    [ResourceType.CLAIM]: SourceType.GHM,
    [ResourceType.MEDICATION_ADMINISTRATION]: SourceType.MEDICATION,
    [ResourceType.MEDICATION_REQUEST]: SourceType.MEDICATION,
    [ResourceType.OBSERVATION]: SourceType.BIOLOGY,
    [ResourceType.QUESTIONNAIRE_RESPONSE]: SourceType.FORM_RESPONSE,
    [ResourceType.IMAGING]: SourceType.IMAGING
  }
  return sourceMap[type] ?? undefined
}

export const getInitSearchCriterias = (type: ResourceType, search?: string) => {
  const initMap: Partial<Record<ResourceType, (search?: string) => SearchCriterias<Filters>>> = {
    [ResourceType.PATIENT]: initPatientsSearchCriterias,
    [ResourceType.DOCUMENTS]: initDocsSearchCriterias,
    [ResourceType.OBSERVATION]: initBioSearchCriterias,
    [ResourceType.CONDITION]: initPmsiSearchCriterias,
    [ResourceType.CLAIM]: initPmsiSearchCriterias,
    [ResourceType.PROCEDURE]: initPmsiSearchCriterias,
    [ResourceType.MEDICATION_ADMINISTRATION]: initMedSearchCriterias,
    [ResourceType.MEDICATION_REQUEST]: initMedSearchCriterias,
    [ResourceType.QUESTIONNAIRE_RESPONSE]: initFormsCriterias,
    [ResourceType.IMAGING]: initImagingCriterias
  }
  return (initMap[type] ?? initPatientsSearchCriterias)(search)
}

export const getReferences = (type: ResourceType): Reference[] => {
  const config = getConfig().features
  const refMap: Partial<Record<ResourceType, string[]>> = {
    [ResourceType.CONDITION]: [config.condition.valueSets.conditionHierarchy.url],
    [ResourceType.PROCEDURE]: [config.procedure.valueSets.procedureHierarchy.url],
    [ResourceType.CLAIM]: [config.claim.valueSets.claimHierarchy.url],
    [ResourceType.MEDICATION_ADMINISTRATION]: [
      config.medication.valueSets.medicationAtc.url,
      config.medication.valueSets.medicationUcd.url
    ],
    [ResourceType.MEDICATION_REQUEST]: [
      config.medication.valueSets.medicationAtc.url,
      config.medication.valueSets.medicationUcd.url
    ],
    [ResourceType.OBSERVATION]: [
      config.observation.valueSets.biologyHierarchyAnabio.url,
      config.observation.valueSets.biologyHierarchyLoinc.url
    ]
  }
  return refMap[type] ? getValueSetsFromSystems(refMap[type]) : []
}

export const getAlertMessages = (type: ResourceType, deidentified: boolean) => {
  const alertMessages: Partial<Record<ResourceType, string[]>> = {
    [ResourceType.IMAGING]: [
      "Seuls les examens présents dans le PACS Philips et rattachés à un Dossier Administratif (NDA) sont actuellement disponibles. Le flux alimentant les métadonnées associées aux séries et aux examens est suspendu depuis le 01/02/2023 suite à la migration du PACS AP-HP. Aucun examen produit après cette date n'est disponible via Cohort360."
    ],
    [ResourceType.OBSERVATION]: [
      "Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020."
    ],
    [ResourceType.CONDITION]: [
      'Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/07/2024. Seuls les diagnostics rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.'
    ],
    [ResourceType.PROCEDURE]: [
      'Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/07/2024. Seuls les diagnostics rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.'
    ],
    [ResourceType.DOCUMENTS]: deidentified
      ? [
          'Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les résultats de la recherche et dans les documents prévisualisés.'
        ]
      : [
          "Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont remplacées par des informations fictives). Vous retrouverez les données personnelles de votre patient en cliquant sur l'aperçu."
        ]
  }

  return alertMessages[type] || []
}

export const fetchAdditionalInfos = async (
  type: ResourceType,
  deidentified: boolean,
  additionalInfo: AdditionalInfo
): Promise<Partial<AdditionalInfo>> => {
  const config = getConfig().features
  const fetchersMap: Record<string, () => Promise<any>> = {
    diagnosticTypesList: () =>
      type === ResourceType.CONDITION && !additionalInfo.diagnosticTypesList
        ? fetchValueSet(config.condition.valueSets.conditionStatus.url)
        : Promise.resolve(undefined),
    prescriptionList: () =>
      type === ResourceType.MEDICATION_REQUEST && !additionalInfo.prescriptionList
        ? getCodeList(config.medication.valueSets.medicationPrescriptionTypes.url).then((res) => res.results)
        : Promise.resolve(undefined),
    administrationList: () =>
      type === ResourceType.MEDICATION_ADMINISTRATION && !additionalInfo.administrationList
        ? getCodeList(config.medication.valueSets.medicationAdministrations.url).then((res) => res.results)
        : Promise.resolve(undefined),
    questionnaires: async () => {
      if (type === ResourceType.QUESTIONNAIRE_RESPONSE && !additionalInfo.questionnaires) {
        const resp = await services.patients.fetchQuestionnaires()
        return {
          raw: resp,
          display: resp.map((elem) => ({
            id: elem.name ?? '',
            label: getFormLabel(elem.name as FormNames) ?? ''
          }))
        }
      }
      return undefined
    },
    modalities: () =>
      type === ResourceType.IMAGING && !additionalInfo.modalities
        ? getCodeList(config.imaging.valueSets.imagingModalities.url, true).then((res) => res.results)
        : Promise.resolve(undefined),
    encounterStatusList: () =>
      [
        ResourceType.CONDITION,
        ResourceType.PROCEDURE,
        ResourceType.CLAIM,
        ResourceType.MEDICATION_ADMINISTRATION,
        ResourceType.MEDICATION_REQUEST,
        ResourceType.QUESTIONNAIRE_RESPONSE,
        ResourceType.IMAGING,
        ResourceType.OBSERVATION,
        ResourceType.DOCUMENTS
      ].includes(type) && !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined)
  }
  const results = await Promise.all(
    Object.entries(fetchersMap).map(async ([key, fetchFn]) => ({ key, value: await fetchFn() }))
  )
  const updatedInfo: Partial<AdditionalInfo> = results.reduce((acc, { key, value }) => {
    if (value !== undefined) acc[key as keyof AdditionalInfo] = value
    return acc
  }, {} as Partial<AdditionalInfo>)
  if (type === ResourceType.PATIENT) {
    updatedInfo.searchByList = searchByListPatients
    updatedInfo.orderByList = deidentified ? orderByListPatientsDeidentified : orderByListPatients
  }
  if (type === ResourceType.DOCUMENTS) updatedInfo.searchByList = searchByListDocuments
  return updatedInfo
}

const fetchValueSet = async (valueSet: string) => {
  try {
    const { results } = await getCodeList(valueSet)
    return results
  } catch (e) {
    return []
  }
}
