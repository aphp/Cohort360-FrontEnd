import { getConfig } from 'config'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useState } from 'react'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { AdditionalInfo, SearchWithFilters } from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import {
  FilterKeys,
  FilterValue,
  Filters,
  FormNames,
  SearchCriteriaKeys,
  SearchCriterias,
  orderByListPatients,
  orderByListPatientsDeidentified,
  searchByListDocuments,
  searchByListPatients
} from 'types/searchCriterias'
import { getInitSearchCriterias, getReferences, getSourceType, narrowSearchCriterias } from 'utils/exploration'
import { selectFiltersAsArray } from 'utils/filters'
import { getFormLabel } from 'utils/formUtils'

export const useExplorationBoard = (type: ResourceType, deidentified: boolean, search?: string) => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({ type, deidentified })
  const init = useMemo(() => getInitSearchCriterias(type, search), [type, search])
  const [
    searchCriterias,
    { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias<Filters>(init)

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters<Filters>(type)
  const references = useMemo(() => getReferences(type), [type])
  const sourceType = useMemo(() => getSourceType(type), [type])

  const narrowedSearchCriterias = useMemo(
    () => narrowSearchCriterias(deidentified, searchCriterias, type),
    [searchCriterias, deidentified, type]
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

  const onSaveSearchCriterias = ({ searchBy, searchInput, filters, orderBy }: SearchWithFilters) => {
    if (searchBy) changeSearchBy(searchBy)
    if (searchInput !== undefined) changeSearchInput(searchInput)
    if (filters) addFilters(filters)
    if (orderBy) changeOrderBy(orderBy)
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
    let searchByList = undefined
    let orderByList = undefined
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
      questionnaires = {
        raw: resp,
        display: resp.map((elem) => ({
          id: elem.name ?? '',
          label: getFormLabel(elem.name as FormNames) ?? ''
        }))
      }
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
    if (type === ResourceType.PATIENT) {
      searchByList = searchByListPatients
      orderByList = deidentified ? orderByListPatientsDeidentified : orderByListPatients
    }
    if (type === ResourceType.DOCUMENTS) searchByList = searchByListDocuments
    setAdditionalInfo({
      references: references,
      sourceType,
      diagnosticTypesList,
      encounterStatusList,
      administrationList,
      prescriptionList,
      questionnaires,
      modalities,
      type,
      deidentified,
      searchByList,
      orderByList
    })
  }

  useEffect(() => {
    removeSearchCriterias()
    fetchAdditionalInfos()
  }, [type, deidentified, search])

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
