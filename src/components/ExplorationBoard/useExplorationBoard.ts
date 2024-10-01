import { getConfig } from 'config'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useState } from 'react'
import useSearchCriterias, {
  initAllDocsSearchCriterias,
  initBioSearchCriterias,
  initFormsCriterias,
  initImagingCriterias,
  initMedSearchCriterias,
  initPatientsSearchCriterias,
  initPmsiSearchCriterias
} from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import {
  FilterKeys,
  FilterValue,
  Filters,
  FormNames,
  LabelObject,
  SearchBy,
  SearchByTypes,
  SearchCriteriaKeys,
  SearchCriterias,
  searchByListDocuments,
  searchByListPatients
} from 'types/searchCriterias'
import { Reference } from 'types/valueSet'
import { narrowSearchCriterias } from 'utils/exploration'
import { selectFiltersAsArray } from 'utils/filters'
import { getFormLabel } from 'utils/formUtils'
import { getValueSetsFromSystems } from 'utils/valueSets'

export type SearchWithFilters = Search & {
  filters?: Filters
}

export type Search = {
  searchInput?: string
  searchBy?: SearchByTypes
}

export type AdditionalInfo = {
  diagnosticTypesList?: LabelObject[]
  encounterStatusList?: LabelObject[]
  references?: Reference[]
  sourceType?: SourceType
  searchByList?: SearchBy[]
  prescriptionList?: LabelObject[]
  administrationList?: LabelObject[]
  questionnaires?: LabelObject[]
  modalities?: LabelObject[]
}

const getInit = (type: ResourceType) => {
  switch (type) {
    case ResourceType.PATIENT:
      return initPatientsSearchCriterias()
    case ResourceType.DOCUMENTS:
      return initAllDocsSearchCriterias()
    case ResourceType.OBSERVATION:
      return initBioSearchCriterias()
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE:
      return initPmsiSearchCriterias()
    case ResourceType.MEDICATION_ADMINISTRATION:
    case ResourceType.MEDICATION_REQUEST:
      return initMedSearchCriterias()
    case ResourceType.QUESTIONNAIRE_RESPONSE:
      return initFormsCriterias()
    case ResourceType.IMAGING:
      return initImagingCriterias()
    default:
      return initPatientsSearchCriterias()
  }
}

export const useExplorationBoard = (type: ResourceType, deidentified: boolean) => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({})
  const [
    searchCriterias,
    { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias<Filters>(getInit(type))

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters<Filters>(type)

  const references = useMemo(() => {
    switch (type) {
      case ResourceType.CONDITION:
        return getValueSetsFromSystems([getConfig().features.condition.valueSets.conditionHierarchy.url])
      case ResourceType.PROCEDURE:
        return getValueSetsFromSystems([getConfig().features.procedure.valueSets.procedureHierarchy.url])
      case ResourceType.CLAIM:
        return getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url])
      case ResourceType.MEDICATION_ADMINISTRATION:
      case ResourceType.MEDICATION_REQUEST:
        return getValueSetsFromSystems([
          getConfig().features.medication.valueSets.medicationAtc.url,
          getConfig().features.medication.valueSets.medicationUcd.url
        ])
      case ResourceType.OBSERVATION:
        return getValueSetsFromSystems([
          getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
          getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
        ])
      default:
        return undefined
    }
  }, [type])

  const sourceType = useMemo(() => {
    switch (type) {
      case ResourceType.CONDITION:
        return SourceType.CIM10
      case ResourceType.PROCEDURE:
        return SourceType.CCAM
      case ResourceType.CLAIM:
        return SourceType.GHM
      default:
        return undefined
    }
  }, [type])

  const narrowedSearchCriterias = useMemo(
    () => narrowSearchCriterias(deidentified, searchCriterias, type),
    [searchCriterias, deidentified]
  )

  const narrowedSelectedFilter = useMemo(() => {
    if (selectedSavedFilter)
      return {
        ...selectedSavedFilter,
        filterParams: narrowSearchCriterias(deidentified, selectedSavedFilter.filterParams, type)
      }
    else return null
  }, [selectedSavedFilter])

  const criterias = useMemo(() => {
    return narrowedSearchCriterias.filters || narrowedSearchCriterias.searchInput
      ? selectFiltersAsArray(narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput)
      : []
  }, [narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput])

  const onRemoveCriteria = (category: FilterKeys | SearchCriteriaKeys, value: FilterValue) => {
    if (category === SearchCriteriaKeys.SEARCH_INPUT) changeSearchInput('')
    else removeFilter(category as FilterKeys, value)
  }

  const onSaveSearchCriterias = ({ searchBy, searchInput, filters }: SearchWithFilters) => {
    if (searchBy) changeSearchBy(searchBy)
    if (searchInput !== undefined) changeSearchInput(searchInput)
    if (filters) addFilters(filters)
  }

  const fetchAdditionalInfos = async () => {
    const fetchValueSet = async (valueSet: string) => {
      try {
        const { results } = await getCodeList(valueSet)
        return results
      } catch (e) {
        return []
      }
    }
    let diagnosticTypesList = additionalInfo.diagnosticTypesList
    let encounterStatusList = additionalInfo.encounterStatusList
    let prescriptionList = additionalInfo.prescriptionList
    let administrationList = additionalInfo.administrationList
    let questionnaires = additionalInfo.questionnaires
    let modalities = additionalInfo.modalities
    if (type === ResourceType.CONDITION && !diagnosticTypesList)
      diagnosticTypesList = await fetchValueSet(getConfig().features.condition.valueSets.conditionStatus.url)
    if (type === ResourceType.MEDICATION_REQUEST && !prescriptionList)
      prescriptionList = (await getCodeList(getConfig().features.medication.valueSets.medicationPrescriptionTypes.url))
        .results
    if (type === ResourceType.MEDICATION_ADMINISTRATION && !administrationList)
      administrationList = (await getCodeList(getConfig().features.medication.valueSets.medicationAdministrations.url))
        .results
    if (type === ResourceType.QUESTIONNAIRE_RESPONSE && !questionnaires) {
      const resp = await services.patients.fetchQuestionnaires()
      questionnaires = resp.map((elem) => ({
        id: elem.name ?? '',
        label: getFormLabel(elem.name as FormNames) ?? ''
      }))
    }
    if (type === ResourceType.IMAGING && !modalities)
      modalities = (await getCodeList(getConfig().features.imaging.valueSets.imagingModalities.url, true)).results
    if (
      (type === ResourceType.CONDITION ||
        type === ResourceType.PROCEDURE ||
        type === ResourceType.CLAIM ||
        type === ResourceType.MEDICATION_ADMINISTRATION ||
        type === ResourceType.MEDICATION_REQUEST ||
        type === ResourceType.QUESTIONNAIRE_RESPONSE ||
        type === ResourceType.IMAGING ||
        type === ResourceType.OBSERVATION ||
        type === ResourceType.DOCUMENTS) &&
      !encounterStatusList
    )
      encounterStatusList = await fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
    setAdditionalInfo({
      references,
      sourceType,
      diagnosticTypesList,
      encounterStatusList,
      administrationList,
      prescriptionList,
      questionnaires,
      modalities
    })
  }

  useEffect(() => {
    removeSearchCriterias()
    fetchAdditionalInfos()
  }, [type])

  useEffect(() => {
    let searchByList = undefined
    if (type === ResourceType.PATIENT) searchByList = searchByListPatients
    if (type === ResourceType.DOCUMENTS) searchByList = searchByListDocuments
    setAdditionalInfo({ ...additionalInfo, searchByList })
  }, [type, deidentified])

  return {
    savedFiltersData: {
      allFilters: allSavedFilters,
      selectedFilter: narrowedSelectedFilter
    },
    savedFiltersActions: {
      onNext: next,
      onSelect: selectFilter,
      onDelete: deleteSavedFilters,
      onEdit: (name: string, searchCriterias: SearchCriterias<Filters>) =>
        patchSavedFilter(name, searchCriterias, deidentified),
      onSubmit: onSaveSearchCriterias
    },
    fetchStatus,
    additionalInfo,
    searchCriterias: narrowedSearchCriterias,
    criterias,
    onSearch: onSaveSearchCriterias,
    onSaveFilter: (name: string) => postSavedFilter(name, narrowedSearchCriterias, deidentified),
    onSort: changeOrderBy,
    onRemoveCriteria,
    resetFetchStatus
  }
}
