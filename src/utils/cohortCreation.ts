import services from 'services/aphp'
import { CriteriaGroup, TemporalConstraintsType, CriteriaItemType, CriteriaGroupType } from 'types'

import { LabelObject } from 'types/searchCriterias'
import {
  Comparators,
  CriteriaType,
  SelectedCriteriaType,
  ResourceType,
  RequeteurCriteriaType
} from 'types/requestCriterias'
import {
  constructFhirFilterForType,
  unbuildCriteriaDataFromDefinition
} from '../components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers'
import { editAllCriteria, editAllCriteriaGroup, pseudonimizeCriteria, buildCohortCreation } from 'state/cohortCreation'
import { AppDispatch } from 'state'
import { Hierarchy } from 'types/hierarchy'
import { CodeCache } from 'state/valueSets'
import { NewDurationRangeType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/types'
import criteriaList, { getAllCriteriaItems } from 'components/CreationCohort/DataList_Criteria'
import { getChildrenFromCodes, HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { createHierarchyRoot } from './hierarchy'
import { FhirItem } from 'types/valueSet'
import { ScopeElement } from 'types/scope'

const REQUETEUR_VERSION = 'v1.6.1'

const DEFAULT_GROUP_ERROR: CriteriaGroup = {
  id: 0,
  title: '',
  type: CriteriaGroupType.AND_GROUP,
  criteriaIds: []
}

type RequeteurGroupType =
  | {
      // GROUP (andGroup | orGroup)
      _type: CriteriaGroupType.AND_GROUP | CriteriaGroupType.OR_GROUP
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      temporalConstraints?: TemporalConstraintsType[]
    }
  // NOT IMPLEMENTED
  | {
      // GROUP (nAmongM)
      _type: CriteriaGroupType.N_AMONG_M
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      nAmongMOptions: {
        n: number
        operator?: Comparators
        timeDelayMin?: number
        timeDelayMax?: number
      }
      temporalConstraints?: TemporalConstraintsType[] // NOT IMPLEMENTED
    }

type RequeteurSearchType = {
  version: string
  _type: string
  sourcePopulation: {
    caresiteCohortList?: string[]
    providerCohortList?: string[]
  }
  request: RequeteurGroupType | undefined
}

export const checkNominativeCriteria = (selectedCriteria: SelectedCriteriaType[]) => {
  const regex = /^[^0/][^/]*\/.*/
  // matches if the value before the first / isn't 0

  const isPatientWithDates = selectedCriteria.some(
    (criterion) =>
      criterion.type === CriteriaType.PATIENT &&
      ((criterion.birthdates !== null && (criterion.birthdates.start !== null || criterion.birthdates.end !== null)) ||
        (criterion.deathDates !== null && (criterion.deathDates.start !== null || criterion.deathDates.end !== null)))
  )

  const isEncounterWithAgesInDays = selectedCriteria.some(
    (criterion) =>
      (criterion.type === CriteriaType.ENCOUNTER || criterion.type === CriteriaType.PATIENT) &&
      (criterion.age?.start?.match(regex) || criterion.age?.end?.match(regex))
  )

  const isSensitiveCriteria = selectedCriteria.some(
    (criterion) =>
      criterion.type === CriteriaType.IPP_LIST ||
      criterion.type === CriteriaType.PREGNANCY ||
      criterion.type === CriteriaType.HOSPIT
  )

  return isPatientWithDates || isEncounterWithAgesInDays || isSensitiveCriteria
}

export const cleanNominativeCriterias = (
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroups: CriteriaGroup[],
  dispatch: AppDispatch,
  selectedPopulation?: ScopeElement[]
) => {
  const cleanDurationRange = (value: NewDurationRangeType | null) => {
    if (value === null) {
      return null
    }
    const regex = /^[^/]*\// // matches everything before the first '/'

    const cleanValue = (value: string | null | undefined) => {
      if (value !== null && value !== undefined) {
        return value.replace(regex, '0/') === '0/0/0' ? null : value.replace(regex, '0/')
      } else return null
    }

    return { start: cleanValue(value.start), end: cleanValue(value.end), includeNull: value.includeNull }
  }

  const cleanedSelectedCriteria = selectedCriteria
    .filter(
      (criteria) =>
        criteria.type !== CriteriaType.IPP_LIST &&
        criteria.type !== CriteriaType.PREGNANCY &&
        criteria.type !== CriteriaType.HOSPIT
    )
    .map((criterion) => {
      switch (criterion.type) {
        case CriteriaType.PATIENT: {
          return {
            ...criterion,
            birthdates: null,
            deathDates: null,
            age: cleanDurationRange(criterion.age)
          }
        }
        case CriteriaType.ENCOUNTER: {
          return {
            ...criterion,
            age: cleanDurationRange(criterion.age)
          }
        }
        default:
          return criterion
      }
    })

  const cleanedCriteriasIds = cleanedSelectedCriteria.map((criterion) => criterion.id)
  const groupsIdsToDelete = criteriaGroups
    .filter((group) => !group.criteriaIds.filter((id) => id > 0).some((id) => cleanedCriteriasIds.includes(id)))
    .map((group) => group.id)
  const cleanedGroups = criteriaGroups
    .map((group) => {
      const cleanIds = group.criteriaIds.filter((id) => {
        // id < 0 would be a group, and id > 0 a criteria
        if (id > 0) {
          return cleanedCriteriasIds.includes(id)
        } else {
          const nestedGroup = criteriaGroups.find((nestedGroup) => nestedGroup.id === id)
          return nestedGroup?.criteriaIds.some((id) => cleanedCriteriasIds.includes(id))
        }
      })

      return {
        ...group,
        criteriaIds: cleanIds
      }
    })
    .filter((group) => !groupsIdsToDelete.includes(group.id))
  dispatch(editAllCriteriaGroup(cleanedGroups))
  dispatch(editAllCriteria(cleanedSelectedCriteria))
  dispatch(pseudonimizeCriteria())
  if (selectedPopulation != undefined && selectedPopulation.length > 0) {
    dispatch(buildCohortCreation({ selectedPopulation: selectedPopulation as Hierarchy<ScopeElement>[] }))
  } else {
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }
}

export const constructFhirFilter = (
  criteria: SelectedCriteriaType,
  deidentified: boolean,
  allcriterias: CriteriaItemType[]
): string => {
  const formDefinition = allcriterias.find((crit) =>
    Object.values(crit.formDefinition?.buildInfo?.type || {}).includes(criteria.type)
  )?.formDefinition
  if (!formDefinition) {
    console.error('No form definition found for criteria type', criteria.type)
    return ''
  }
  return constructFhirFilterForType(criteria, deidentified, formDefinition)
}

const mapCriteriaToResource = (criteriaType: CriteriaType): ResourceType => {
  const mapping: { [key in CriteriaType]?: ResourceType } = {
    [CriteriaType.IPP_LIST]: ResourceType.IPP_LIST,
    [CriteriaType.PATIENT]: ResourceType.PATIENT,
    [CriteriaType.ENCOUNTER]: ResourceType.ENCOUNTER,
    [CriteriaType.DOCUMENTS]: ResourceType.DOCUMENTS,
    [CriteriaType.CONDITION]: ResourceType.CONDITION,
    [CriteriaType.PROCEDURE]: ResourceType.PROCEDURE,
    [CriteriaType.CLAIM]: ResourceType.CLAIM,
    [CriteriaType.MEDICATION_REQUEST]: ResourceType.MEDICATION_REQUEST,
    [CriteriaType.MEDICATION_ADMINISTRATION]: ResourceType.MEDICATION_ADMINISTRATION,
    [CriteriaType.OBSERVATION]: ResourceType.OBSERVATION,
    [CriteriaType.IMAGING]: ResourceType.IMAGING,
    [CriteriaType.QUESTIONNAIRE_RESPONSE]: ResourceType.QUESTIONNAIRE_RESPONSE,
    [CriteriaType.PREGNANCY]: ResourceType.QUESTIONNAIRE_RESPONSE,
    [CriteriaType.HOSPIT]: ResourceType.QUESTIONNAIRE_RESPONSE
  }
  const resourceType = mapping[criteriaType]
  if (resourceType) return resourceType
  throw new Error('Unknown criteria type')
}

const findQuestionnaireName = (filters: string[]) => {
  const regex = /questionnaire.name=(.*)/
  for (const item of filters) {
    const match = regex.exec(item)
    if (match?.[1]) {
      return match[1]
    }
  }
}

export const unbuildCriteriaData = async (
  element: RequeteurCriteriaType,
  critieriaDefinitions: CriteriaItemType[]
): Promise<SelectedCriteriaType> => {
  const criteriaDefinition = critieriaDefinitions.filter((item) =>
    Object.keys(item.formDefinition?.buildInfo.type || {}).includes(element.resourceType)
  )

  if (criteriaDefinition.length === 0) {
    throw new Error('Criteria definition not found')
  }

  if (criteriaDefinition.length === 1 && criteriaDefinition[0].formDefinition) {
    return unbuildCriteriaDataFromDefinition(element, criteriaDefinition[0].formDefinition)
  }

  const splittedFilters = element.filterFhir.split('&')
  const subType = findQuestionnaireName(splittedFilters)
  if (subType) {
    const questionnaireDefinition = criteriaDefinition.find(
      (item) => item.formDefinition?.buildInfo?.subType === subType
    )
    if (questionnaireDefinition?.formDefinition) {
      return unbuildCriteriaDataFromDefinition(element, questionnaireDefinition.formDefinition)
    }
  }
  throw new Error('Criteria subtype definition not found')
}

export function buildRequest(
  selectedPopulation: (Hierarchy<ScopeElement> | undefined)[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroup[],
  temporalConstraints: TemporalConstraintsType[]
): string {
  const criteriaDefinitions = getAllCriteriaItems(criteriaList())
  if (!selectedPopulation) return ''
  selectedPopulation = selectedPopulation.filter((elem) => elem !== undefined)
  const deidentified: boolean =
    selectedPopulation === null
      ? false
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

  const exploreCriteriaGroup = (itemIds: number[]): (RequeteurCriteriaType | RequeteurGroupType)[] => {
    let children: (RequeteurCriteriaType | RequeteurGroupType)[] = []

    for (const itemId of itemIds) {
      let child: RequeteurCriteriaType | RequeteurGroupType | null = null
      const isGroup = itemId < 0
      if (!isGroup) {
        // return RequeteurCriteriaType
        const item: SelectedCriteriaType | undefined = selectedCriteria.find(({ id }) => id === itemId)
        if (!item) {
          console.error('Unknown criteria id', itemId)
          continue
        }
        child = {
          _type: 'basicResource',
          _id: item.id ?? 0,
          name: item.title,
          isInclusive: item.isInclusive ?? true,
          resourceType: mapCriteriaToResource(item.type),
          filterFhir: constructFhirFilter(item, deidentified, criteriaDefinitions),
          occurrence: !(item.type === CriteriaType.PATIENT || item.type === CriteriaType.IPP_LIST)
            ? {
                n: item.occurrence.value,
                operator: item.occurrence.comparator
              }
            : undefined
        }
      } else {
        // return RequeteurGroupType
        const group: CriteriaGroup = criteriaGroup.find(({ id }) => id === itemId) ?? DEFAULT_GROUP_ERROR

        // DO SPECIAL THING FOR `NamongM`
        if (group.type === CriteriaGroupType.N_AMONG_M) {
          child = {
            _type: CriteriaGroupType.N_AMONG_M,
            _id: group.id,
            isInclusive: group.isInclusive ?? true,
            criteria: exploreCriteriaGroup(group.criteriaIds),
            nAmongMOptions: {
              n: group.options.number,
              operator: group.options.operator
            }
          }
        } else {
          child = {
            _type: group.type,
            _id: group.id,
            isInclusive: group.isInclusive ?? true,
            criteria: exploreCriteriaGroup(group.criteriaIds)
          }
        }
      }
      if (child) {
        children = [...children, child]
      }
    }
    return children
  }

  const mainCriteriaGroups = criteriaGroup.find(({ id }) => id === 0)

  const json: RequeteurSearchType = {
    version: REQUETEUR_VERSION,
    _type: 'request',
    sourcePopulation: {
      caresiteCohortList: selectedPopulation
        ?.map((_selectedPopulation) => _selectedPopulation?.cohort_id)
        .filter((item): item is string => !!item && item !== 'loading')
    },
    request: !mainCriteriaGroups
      ? undefined
      : {
          _id: 0,
          _type:
            mainCriteriaGroups.type === CriteriaGroupType.OR_GROUP
              ? CriteriaGroupType.OR_GROUP
              : CriteriaGroupType.AND_GROUP,
          isInclusive: !!mainCriteriaGroups.isInclusive,
          criteria: exploreCriteriaGroup(mainCriteriaGroups.criteriaIds),
          temporalConstraints: temporalConstraints.filter(({ constraintType }) => constraintType !== 'none')
        }
  }

  return JSON.stringify(json)
}

type UnbuildRequestReturnType = {
  population: Hierarchy<ScopeElement, string>[] | null
  criteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroup[]
  temporalConstraints?: TemporalConstraintsType[]
  idRemap: Record<number, number>
}

// eslint-disable-next-line max-statements
export async function unbuildRequest(_json: string): Promise<UnbuildRequestReturnType> {
  const criteriaDefinitions = getAllCriteriaItems(criteriaList())
  // TODO: handle potential errors (here or in the caller)
  // so if a single criteria fails, the whole request is not lost
  //  let population: (ScopeTreeRow | undefined)[] | null = null
  let criteriaItems: RequeteurCriteriaType[] = []
  let criteriaGroup: RequeteurGroupType[] = []
  let temporalConstraints: TemporalConstraintsType[] = []
  if (!_json) {
    return {
      population: null,
      criteria: [],
      criteriaGroup: [],
      idRemap: {}
    }
  }

  const json = JSON.parse(_json) as RequeteurSearchType
  const {
    sourcePopulation: { caresiteCohortList },
    request
  } = json

  const population = await services.perimeters.fetchPopulationForRequeteur(caresiteCohortList)

  // retrieve temporal constraints
  if (request && request.temporalConstraints) {
    temporalConstraints = request.temporalConstraints
  }
  /**
   * Retrieve criteria + groups
   *
   */
  const exploreRequest = (currentItem: RequeteurGroupType): void => {
    const { criteria } = currentItem

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criteriaItems = [...criteriaItems, criterion]
      } else {
        const groupCriteria = criterion as RequeteurGroupType
        criteriaGroup = [...criteriaGroup, { ...groupCriteria }]
        if (groupCriteria && groupCriteria.criteria && groupCriteria.criteria.length > 0) {
          exploreRequest(groupCriteria)
        }
      }
    }
  }

  if (request !== undefined) {
    criteriaGroup = [...criteriaGroup, { ...request }]
    exploreRequest(request)
  } else {
    return { population, criteria: [], criteriaGroup: [], idRemap: {} }
  }

  const convertJsonObjectsToCriteria = async (
    _criteriaItems: RequeteurCriteriaType[]
  ): Promise<SelectedCriteriaType[]> => {
    let newSelectedCriteriaItems: SelectedCriteriaType[] = []

    for (const criteriaItem of _criteriaItems) {
      newSelectedCriteriaItems = [
        ...newSelectedCriteriaItems,
        await unbuildCriteriaData(criteriaItem, criteriaDefinitions)
      ]
    }

    return newSelectedCriteriaItems
  }

  const convertJsonObjectsToCriteriaGroup: (_criteriaGroup: RequeteurGroupType[]) => CriteriaGroup[] = (
    _criteriaGroup
  ) =>
    _criteriaGroup && _criteriaGroup.length > 0
      ? _criteriaGroup
          .map(
            (groupItem: RequeteurGroupType) =>
              ({
                id: groupItem._id,
                title: 'Groupe de critères',
                criteriaIds:
                  groupItem.criteria && groupItem.criteria.length > 0
                    ? groupItem.criteria.map((criteria) => criteria._id)
                    : [],
                isSubGroup: !!groupItem.criteria.length,
                isInclusive: groupItem.isInclusive,
                type: groupItem._type,
                ...(groupItem._type === CriteriaGroupType.N_AMONG_M && {
                  options: {
                    operator: groupItem.nAmongMOptions.operator,
                    number: groupItem.nAmongMOptions.n,
                    timeDelayMin: groupItem.nAmongMOptions.timeDelayMin ?? 0,
                    timeDelayMax: groupItem.nAmongMOptions.timeDelayMax ?? 0
                  }
                })
              } as CriteriaGroup)
          )
          .sort((prev, next) => next.id - prev.id)
      : []

  let _criteriaGroup = convertJsonObjectsToCriteriaGroup(criteriaGroup)
  const criteriaGroupSaved = [..._criteriaGroup]
  const idMap: { [key: number]: number } = {} // Object to hold previous and new IDs mapping

  // Reset Group criteriaIds
  _criteriaGroup = _criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

  criteriaItems = criteriaItems.map((_criteria, index) => {
    // Get the parent of current critria
    const parentGroup = criteriaGroupSaved.find((itemGroup) =>
      itemGroup.criteriaIds.find((criteriaId) => criteriaId === _criteria._id)
    )
    if (parentGroup) {
      const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)
      // Assign the new criterion identifier to its group
      if (indexOfParent !== -1) {
        _criteriaGroup[indexOfParent] = {
          ..._criteriaGroup[indexOfParent],
          criteriaIds: [..._criteriaGroup[indexOfParent].criteriaIds, index + 1]
        }
      }
    }
    idMap[_criteria._id] = index + 1
    return { ..._criteria, _id: index + 1 }
  })

  // // Re-assign id and criteria to groups
  for (let index = 0; index < _criteriaGroup.length; index++) {
    const _criteriaGroupItem = _criteriaGroup[index]
    const newId = index * -1

    // Search parent
    const parentGroup = criteriaGroupSaved.find((itemGroup) =>
      itemGroup.criteriaIds.find((criteriaId) => criteriaId === _criteriaGroupItem.id)
    )
    if (parentGroup) {
      // Get index
      const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)

      // Assign the new criteria group identifier to it group parent
      if (indexOfParent !== -1) {
        let newCriteriaIds =
          _criteriaGroup[indexOfParent] && _criteriaGroup[indexOfParent].criteriaIds?.length > 0
            ? _criteriaGroup[indexOfParent].criteriaIds
            : criteriaGroupSaved[indexOfParent].criteriaIds

        // Delete old assignment
        // If ID changes, delete it
        if (newId !== _criteriaGroupItem.id)
          newCriteriaIds = newCriteriaIds.filter((elem) => elem !== _criteriaGroupItem.id)

        // Assign new id and filter doublon (parent group)
        newCriteriaIds = [...newCriteriaIds, newId].filter((item, index, array) => array.indexOf(item) === index)
        _criteriaGroup[indexOfParent].criteriaIds = newCriteriaIds
      }
    }

    // Assign new id (current group)
    idMap[_criteriaGroupItem.id] = newId
    _criteriaGroup[index].id = newId
  }

  const updatedConstraintsIds = temporalConstraints.map((constraint) => {
    const oldIds = constraint.idList as number[]
    const newIds = oldIds.map((id) => idMap[id] ?? id)
    return { ...constraint, idList: newIds }
  })

  // End of unbuild
  return {
    population,
    criteria: await convertJsonObjectsToCriteria(criteriaItems),
    criteriaGroup: _criteriaGroup,
    temporalConstraints: updatedConstraintsIds,
    idRemap: Object.fromEntries(Object.entries(idMap).map(([k, v]) => [v, Number(k)]))
  }
}

const getCodesForValueSet = async (code: string, systems: string[]): Promise<Hierarchy<FhirItem>[] | undefined> => {
  if (code === HIERARCHY_ROOT && systems.length) return [createHierarchyRoot(systems[0])]
  for (const system of systems) {
    try {
      return (await getChildrenFromCodes(system, [code])).results
    } catch {
      console.error("Ce n'est pas une erreur.")
    }
  }
}

/**
 * Fetches all codes for the criteria within the query
 * @param criteriaList list of criteria definitions
 * @param selectedCriteria list of criteria data
 * @param oldCriteriaCache old cache of criteria codes
 * @returns a newly updated cache of criteria codes
 */
export const fetchCriteriasCodes = async (
  criteriaList: readonly CriteriaItemType[],
  selectedCriteria: SelectedCriteriaType[],
  oldCriteriaCache?: CodeCache
): Promise<CodeCache> => {
  const updatedCriteriaData: CodeCache = { ...oldCriteriaCache }
  const allCriterias = getAllCriteriaItems(criteriaList)
  for (const criteria of allCriterias) {
    const criteriaValues = selectedCriteria.filter(
      (criterion) => criterion.type === criteria.id || criteria.types?.includes(criterion.type)
    )
    for (const section of criteria.formDefinition?.itemSections || []) {
      for (const item of section.items || []) {
        if (item.type === 'codeSearch') {
          const defaultValueSet = item.valueSetsInfo[0].url
          for (const criterion of criteriaValues) {
            const dataKey = item.valueKey as keyof SelectedCriteriaType
            const labelValues = criterion[dataKey] as unknown as LabelObject[]
            if (labelValues && labelValues.length > 0) {
              for (const code of labelValues) {
                const codeSystem = code.system ?? defaultValueSet
                const valueSetCodeCache = [...(updatedCriteriaData[codeSystem] ?? [])]
                if (!valueSetCodeCache.find((data) => data.id === code.id)) {
                  try {
                    const fetchedCode = await getCodesForValueSet(code.id, [codeSystem])
                    if (fetchedCode) {
                      valueSetCodeCache.push(...fetchedCode)
                    } else {
                      console.warn(`Code ${code.id} not found in system ${codeSystem}`)
                    }
                  } catch (e) {
                    // fail silently
                    console.error(`Error fetching code ${code.id} from system ${codeSystem}`, e)
                  }
                }
                updatedCriteriaData[codeSystem] = valueSetCodeCache
              }
            }
          }
        }
      }
    }
  }
  return updatedCriteriaData
}

type JoinRequestReturnType = {
  json: string
  criteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroup[]
  idRemap: Record<number, number>
}

export const joinRequest = async (
  oldJson: string,
  newJson: string,
  parentId: number | null
): Promise<JoinRequestReturnType> => {
  const oldRequest = JSON.parse(oldJson) as RequeteurSearchType
  const newRequest = JSON.parse(newJson) as RequeteurSearchType

  const isRequeteurGroupType = (
    criterion: RequeteurGroupType | RequeteurCriteriaType
  ): criterion is RequeteurGroupType => {
    return criterion && !!(criterion as RequeteurGroupType).criteria.length
  }

  const changeIdOfRequest = (
    criteria: (RequeteurGroupType | RequeteurCriteriaType)[]
  ): (RequeteurGroupType | RequeteurCriteriaType)[] => {
    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criterion._id += 128
      } else {
        criterion._id -= 128
        if (isRequeteurGroupType(criterion) && criterion.criteria && criterion.criteria.length > 0) {
          criterion.criteria = changeIdOfRequest(criterion.criteria)
        }
      }
    }
    return criteria
  }

  const criteriaGroupFromNewRequest: RequeteurGroupType = {
    _id: (newRequest?.request?._id ?? 0) - 128,
    _type:
      newRequest.request?._type === CriteriaGroupType.AND_GROUP
        ? CriteriaGroupType.AND_GROUP
        : CriteriaGroupType.OR_GROUP,
    isInclusive: true,
    criteria: changeIdOfRequest(newRequest.request?.criteria || [])
  }

  const fillRequestWithNewRequest = (criterionGroup?: RequeteurGroupType): RequeteurGroupType | undefined => {
    if (!criterionGroup) return criterionGroup

    if (criterionGroup._id === parentId) {
      criterionGroup.criteria = [...criterionGroup.criteria, criteriaGroupFromNewRequest]
    }

    if (!criterionGroup.criteria) return criterionGroup
    const { criteria = [] } = criterionGroup
    for (let criterion of criteria) {
      if (criterion?._type === CriteriaGroupType.OR_GROUP || criterion?._type === CriteriaGroupType.AND_GROUP) {
        // @ts-ignore
        criterion = fillRequestWithNewRequest(criterion)
      }
    }
    return criterionGroup
  }

  const newJoinedRequest = {
    ...oldRequest,
    request: fillRequestWithNewRequest(oldRequest.request)
  }

  const { population, criteria, criteriaGroup, idRemap } = await unbuildRequest(JSON.stringify(newJoinedRequest))

  return {
    json: buildRequest(population, criteria, criteriaGroup, []),
    criteria,
    criteriaGroup,
    idRemap
  }
}
