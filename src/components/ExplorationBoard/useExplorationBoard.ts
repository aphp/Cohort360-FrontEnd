import { getConfig } from 'config'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useState } from 'react'
import useSearchCriterias, {
  initAllDocsSearchCriterias,
  initPatientsSearchCriterias,
  initPmsiSearchCriterias
} from 'reducers/searchCriteriasReducer'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import {
  FilterKeys,
  FilterValue,
  Filters,
  LabelObject,
  PMSIFilters,
  PatientsFilters,
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
}

const getInit = (type: ResourceType) => {
  switch (type) {
    case ResourceType.PATIENT:
      return initPatientsSearchCriterias()
    case ResourceType.DOCUMENTS:
      return initAllDocsSearchCriterias()
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE:
      return initPmsiSearchCriterias()
    default:
      return initPatientsSearchCriterias()
  }
}

export const useExplorationBoard = (type: ResourceType, deidentified: boolean) => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({})
  const [
    searchCriterias,
    { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias<PatientsFilters | PMSIFilters>(getInit(type))

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters<PatientsFilters | PMSIFilters>(type)

  const references = useMemo(() => {
    switch (type) {
      case ResourceType.CONDITION:
        return getValueSetsFromSystems([getConfig().features.condition.valueSets.conditionHierarchy.url])
      case ResourceType.PROCEDURE:
        return getValueSetsFromSystems([getConfig().features.procedure.valueSets.procedureHierarchy.url])
      case ResourceType.CLAIM:
        return getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url])
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
    console.log('test send filtres', filters)
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
    if (type === ResourceType.CONDITION && !diagnosticTypesList)
      diagnosticTypesList = await fetchValueSet(getConfig().features.condition.valueSets.conditionStatus.url)
    if (
      (type === ResourceType.CONDITION ||
        type === ResourceType.PROCEDURE ||
        type === ResourceType.CLAIM ||
        type === ResourceType.DOCUMENTS) &&
      !encounterStatusList
    )
      encounterStatusList = await fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
    setAdditionalInfo({
      references,
      sourceType,
      diagnosticTypesList,
      encounterStatusList
    })
  }

  useEffect(() => {
    removeSearchCriterias()
    fetchAdditionalInfos()
  }, [type])

  useEffect(() => {
    if (type === ResourceType.PATIENT) setAdditionalInfo({ ...additionalInfo, searchByList: searchByListPatients })
    else if (type === ResourceType.DOCUMENTS)
      setAdditionalInfo({ ...additionalInfo, searchByList: searchByListDocuments })
    else setAdditionalInfo({ ...additionalInfo, searchByList: undefined })
  }, [type])

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
    onSaveFilter: (name: string) => postSavedFilter(name, narrowedSearchCriterias /*searchCriterias*/, deidentified),
    onSort: changeOrderBy,
    onRemoveCriteria,
    resetFetchStatus
  }
}
