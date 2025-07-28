/**
 * @fileoverview Cohort Creation Utilities
 *
 * This module provides comprehensive utilities for building, parsing, and managing cohort creation requests
 * in the Cohort360 medical data exploration platform. It handles the conversion between UI state and
 * the underlying "Requeteur" format used for medical data queries, including FHIR filter construction,
 * criteria validation, and request serialization.
 *
 * Key functionalities:
 * - Building and parsing cohort creation requests (Requeteur format)
 * - FHIR filter construction for medical criteria
 * - Nominative criteria validation and cleaning
 * - Code caching for medical terminologies
 * - Request joining for complex query composition
 *
 * @module cohortCreation
 * @version 1.6.1
 * @since 1.0.0
 */

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
import { formatAge } from './age'

/** Current version of the Requeteur format used for cohort requests */
const REQUETEUR_VERSION = 'v1.6.1'

/** Default criteria group used as fallback when group lookup fails */
const DEFAULT_GROUP_ERROR: CriteriaGroup = {
  id: 0,
  title: '',
  type: CriteriaGroupType.AND_GROUP,
  criteriaIds: []
}

/**
 * Represents a group of criteria in the Requeteur format.
 * Supports logical operators (AND/OR) and N-among-M constraints.
 */
type RequeteurGroupType =
  | {
      /** Group type: AND or OR logical operator */
      _type: CriteriaGroupType.AND_GROUP | CriteriaGroupType.OR_GROUP
      /** Unique identifier for the group */
      _id: number
      /** Whether the group should be included (true) or excluded (false) */
      isInclusive: boolean
      /** Child criteria and nested groups */
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      /** Optional temporal constraints between criteria */
      temporalConstraints?: TemporalConstraintsType[]
    }
  | {
      /** Group type: N-among-M constraint */
      _type: CriteriaGroupType.N_AMONG_M
      /** Unique identifier for the group */
      _id: number
      /** Whether the group should be included (true) or excluded (false) */
      isInclusive: boolean
      /** Child criteria and nested groups */
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      /** Configuration for N-among-M constraint */
      nAmongMOptions: {
        /** Number N in "N among M" */
        n: number
        /** Comparison operator for the constraint */
        operator?: Comparators
        /** Minimum time delay between occurrences (not implemented) */
        timeDelayMin?: number
        /** Maximum time delay between occurrences (not implemented) */
        timeDelayMax?: number
      }
      /** Temporal constraints (not implemented for N-among-M) */
      temporalConstraints?: TemporalConstraintsType[]
    }

/**
 * Complete search request structure in Requeteur format.
 * This is the top-level object that gets serialized and sent to the backend.
 */
type RequeteurSearchType = {
  /** Version of the Requeteur format */
  version: string
  /** Type identifier for the request */
  _type: string
  /** Source population definition */
  sourcePopulation: {
    /** List of care site cohort IDs to include */
    caresiteCohortList?: string[]
    /** List of provider cohort IDs to include (not currently used) */
    providerCohortList?: string[]
  }
  /** Root criteria group defining the search logic */
  request: RequeteurGroupType | undefined
}

/**
 * Checks if the selected criteria contain nominative (personally identifiable) information.
 *
 * This function identifies criteria that could potentially identify patients, including:
 * - Patient criteria with birth or death dates
 * - Encounter/Patient criteria with ages specified in days (more precise than years)
 * - Sensitive criteria types (IPP lists, pregnancy, hospitalization)
 *
 * @param selectedCriteria - Array of criteria to check for nominative information
 * @returns True if any nominative criteria are found, false otherwise
 *
 * @example
 * ```typescript
 * const criteria = [{
 *   type: CriteriaType.PATIENT,
 *   birthdates: { start: '1990-01-01', end: null }
 * }];
 * const isNominative = checkNominativeCriteria(criteria); // returns true
 * ```
 */
export const checkNominativeCriteria = (selectedCriteria: SelectedCriteriaType[]) => {
  const regex = /^[^0/][^/]*\/.*/

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

/**
 * Removes nominative information from criteria to comply with privacy requirements.
 *
 * This function performs the following cleaning operations:
 * - Removes sensitive criteria types (IPP lists, pregnancy, hospitalization)
 * - Clears birth and death dates from patient criteria
 * - Anonymizes age values by removing day-level precision
 * - Updates the Redux store with cleaned criteria and groups
 * - Rebuilds the cohort creation state
 *
 * @param selectedCriteria - Array of criteria to clean
 * @param criteriaGroups - Array of criteria groups to update
 * @param dispatch - Redux dispatch function for state updates
 * @param selectedPopulation - Optional population scope to maintain
 *
 * @example
 * ```typescript
 * cleanNominativeCriterias(
 *   selectedCriteria,
 *   criteriaGroups,
 *   dispatch,
 *   selectedPopulation
 * );
 * ```
 */
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
    const regex = /^[^/]*\//

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

/**
 * Constructs a FHIR filter string for a given criterion.
 *
 * This function takes a UI criterion and converts it into a FHIR-compliant
 * filter string that can be used in API requests. It uses the criterion's
 * form definition to determine the appropriate FHIR mapping.
 *
 * @param criteria - The criterion to convert to a FHIR filter
 * @param deidentified - Whether the data should be deidentified
 * @param allcriterias - Array of all available criteria definitions
 * @returns FHIR filter string, or empty string if no definition found
 *
 * @example
 * ```typescript
 * const filter = constructFhirFilter(
 *   { type: CriteriaType.CONDITION, code: 'I50' },
 *   false,
 *   criteriaDefinitions
 * );
 * // Returns: "code=I50&_profile=http://..."
 * ```
 */
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

/**
 * Maps a criteria type to its corresponding FHIR resource type.
 *
 * @param criteriaType - The UI criteria type
 * @returns The corresponding FHIR resource type
 * @throws Error if the criteria type is unknown
 *
 * @internal
 */
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

/**
 * Extracts questionnaire name from FHIR filter strings.
 *
 * @param filters - Array of FHIR filter strings
 * @returns The questionnaire name if found, undefined otherwise
 *
 * @internal
 */
const findQuestionnaireName = (filters: string[]) => {
  const regex = /questionnaire.name=(.*)/
  for (const item of filters) {
    const match = regex.exec(item)
    if (match?.[1]) {
      return match[1]
    }
  }
}

/**
 * Converts a Requeteur criteria object back to UI criteria format.
 *
 * This function is the inverse of criteria building - it takes a serialized
 * criterion from a saved request and reconstructs the UI-friendly format
 * with all necessary metadata for display and editing.
 *
 * @param element - The Requeteur criteria to convert
 * @param critieriaDefinitions - Array of available criteria definitions
 * @returns Promise resolving to the UI criteria format
 * @throws Error if criteria definition or subtype is not found
 *
 * @example
 * ```typescript
 * const uiCriteria = await unbuildCriteriaData(
 *   requeteurCriteria,
 *   criteriaDefinitions
 * );
 * ```
 */
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

/**
 * Builds a complete cohort request in Requeteur format.
 *
 * This is the main function that converts the UI state (selected population,
 * criteria, groups, and constraints) into a serialized JSON string that can
 * be sent to the backend for execution.
 *
 * The function:
 * - Determines if deidentification is required based on population access
 * - Recursively processes criteria groups and their nested children
 * - Constructs FHIR filters for each criterion
 * - Applies temporal constraints
 * - Serializes the complete request structure
 *
 * @param selectedPopulation - Array of selected population hierarchies
 * @param selectedCriteria - Array of selected search criteria
 * @param criteriaGroup - Array of criteria groups defining logical structure
 * @param temporalConstraints - Array of temporal relationships between criteria
 * @returns JSON string representation of the complete request
 *
 * @example
 * ```typescript
 * const requestJson = buildRequest(
 *   selectedPopulation,
 *   selectedCriteria,
 *   criteriaGroups,
 *   temporalConstraints
 * );
 * // Can be sent to backend API
 * ```
 */
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
          patientAge:
            item?.encounterAgeRange?.start || item?.encounterAgeRange?.end
              ? {
                  minAge: item?.encounterAgeRange?.start
                    ? formatAge(item?.encounterAgeRange?.start, 'DD/MM/YY', 'YY-MM-DD')
                    : undefined,
                  maxAge: item?.encounterAgeRange?.end
                    ? formatAge(item?.encounterAgeRange?.end, 'DD/MM/YY', 'YY-MM-DD')
                    : undefined
                }
              : undefined,
          occurrence: !(item.type === CriteriaType.PATIENT || item.type === CriteriaType.IPP_LIST)
            ? {
                n: item.occurrence.value,
                operator: item.occurrence.comparator
              }
            : undefined
        }
      } else {
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
  let request: RequeteurGroupType | undefined = undefined
  if (mainCriteriaGroups) {
    const baseGroup = {
      _id: 0,
      isInclusive: !!mainCriteriaGroups.isInclusive,
      criteria: exploreCriteriaGroup(mainCriteriaGroups.criteriaIds),
      temporalConstraints: temporalConstraints.filter(({ constraintType }) => constraintType !== 'none')
    }
    if (mainCriteriaGroups.type === CriteriaGroupType.N_AMONG_M)
      request = {
        ...baseGroup,
        _type: CriteriaGroupType.N_AMONG_M,
        nAmongMOptions: {
          n: mainCriteriaGroups.options.number,
          operator: mainCriteriaGroups.options.operator
        }
      }
    else
      request = {
        ...baseGroup,
        _type: mainCriteriaGroups.type
      }
  }
  const json: RequeteurSearchType = {
    version: REQUETEUR_VERSION,
    _type: 'request',
    sourcePopulation: {
      caresiteCohortList: selectedPopulation
        ?.map((_selectedPopulation) => _selectedPopulation?.cohort_id)
        .filter((item): item is string => !!item && item !== 'loading')
    },
    request
  }
  return JSON.stringify(json)
}

/**
 * Return type for the unbuildRequest function.
 * Contains all components needed to reconstruct the UI state from a saved request.
 */
type UnbuildRequestReturnType = {
  /** Reconstructed population hierarchy */
  population: Hierarchy<ScopeElement, string>[] | null
  /** Array of reconstructed UI criteria */
  criteria: SelectedCriteriaType[]
  /** Array of reconstructed criteria groups */
  criteriaGroup: CriteriaGroup[]
  /** Optional temporal constraints */
  temporalConstraints?: TemporalConstraintsType[]
  /** Mapping from new IDs to original IDs for reference */
  idRemap: Record<number, number>
}

/**
 * Parses a serialized cohort request back into UI components.
 *
 * This function is the inverse of buildRequest - it takes a JSON string
 * from a saved cohort request and reconstructs all the UI state needed
 * to display and edit the request.
 *
 * The process involves:
 * - Parsing the JSON request structure
 * - Fetching population data from cohort IDs
 * - Recursively extracting criteria and groups
 * - Converting Requeteur criteria back to UI format
 * - Reassigning IDs to avoid conflicts
 * - Updating temporal constraint references
 *
 * @param _json - Serialized JSON string of the cohort request
 * @returns Promise resolving to all reconstructed request parameters
 *
 * @example
 * ```typescript
 * const { population, criteria, criteriaGroup, idRemap } =
 *   await unbuildRequest(savedRequestJson);
 * // Use these to restore UI state
 * ```
 */

// eslint-disable-next-line max-statements
export async function unbuildRequest(_json: string): Promise<UnbuildRequestReturnType> {
  const criteriaDefinitions = getAllCriteriaItems(criteriaList())
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
  if (request?.temporalConstraints) {
    temporalConstraints = request.temporalConstraints
  }
  const exploreRequest = (currentItem: RequeteurGroupType): void => {
    const { criteria } = currentItem

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criteriaItems = [...criteriaItems, criterion]
      } else {
        const groupCriteria = criterion as RequeteurGroupType
        criteriaGroup = [...criteriaGroup, { ...groupCriteria }]
        if (groupCriteria?.criteria && groupCriteria.criteria.length > 0) {
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
  const idMap: { [key: number]: number } = {}

  // Reset Group criteriaIds
  _criteriaGroup = _criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

  criteriaItems = criteriaItems.map((_criteria, index) => {
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

  for (let index = 0; index < _criteriaGroup.length; index++) {
    const _criteriaGroupItem = _criteriaGroup[index]
    const newId = index * -1

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

        if (newId !== _criteriaGroupItem.id)
          newCriteriaIds = newCriteriaIds.filter((elem) => elem !== _criteriaGroupItem.id)

        newCriteriaIds = [...newCriteriaIds, newId].filter((item, index, array) => array.indexOf(item) === index)
        _criteriaGroup[indexOfParent].criteriaIds = newCriteriaIds
      }
    }

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

/**
 * Fetches hierarchical code data for a given code and value set systems.
 *
 * @param code - The code to fetch (or HIERARCHY_ROOT for root level)
 * @param systems - Array of value set system URLs to search
 * @returns Promise resolving to hierarchical code data, or undefined if not found
 *
 * @internal
 */
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
 * Fetches and caches all medical codes referenced in the selected criteria.
 *
 * This function scans through all selected criteria to find code-based searches
 * (such as ICD-10 diagnoses, procedures, etc.) and ensures that the hierarchical
 * code data is available in the cache for display and validation purposes.
 *
 * The function:
 * - Iterates through all criteria definitions and selected criteria
 * - Identifies code search fields in the criteria forms
 * - Fetches missing codes from their respective value sets
 * - Updates and returns an enhanced code cache
 *
 * @param criteriaList - Array of available criteria definitions
 * @param selectedCriteria - Array of currently selected criteria
 * @param oldCriteriaCache - Existing code cache to update
 * @returns Promise resolving to updated code cache with all referenced codes
 *
 * @example
 * ```typescript
 * const updatedCache = await fetchCriteriasCodes(
 *   criteriaDefinitions,
 *   selectedCriteria,
 *   currentCache
 * );
 * // Cache now contains all codes referenced in the criteria
 * ```
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

/**
 * Return type for the joinRequest function.
 * Contains the merged request and all reconstructed UI components.
 */
type JoinRequestReturnType = {
  /** Serialized JSON of the joined request */
  json: string
  /** Array of all criteria from both requests */
  criteria: SelectedCriteriaType[]
  /** Array of all criteria groups from both requests */
  criteriaGroup: CriteriaGroup[]
  /** ID mapping for tracking merged elements */
  idRemap: Record<number, number>
}

/**
 * Merges two cohort requests into a single combined request.
 *
 * This function takes two separate cohort requests and combines them by
 * adding the new request as a child group under the specified parent in
 * the old request. It handles ID conflicts by shifting IDs in the new
 * request and maintains referential integrity.
 *
 * The merge process:
 * - Parses both JSON requests
 * - Shifts IDs in the new request to avoid conflicts
 * - Inserts the new request as a child of the specified parent
 * - Rebuilds the combined request with proper ID mapping
 *
 * @param oldJson - JSON string of the existing request
 * @param newJson - JSON string of the request to merge in
 * @param parentId - ID of the group where the new request should be added
 * @returns Promise resolving to the joined request and UI components
 *
 * @example
 * ```typescript
 * const joined = await joinRequest(
 *   existingRequestJson,
 *   newRequestJson,
 *   parentGroupId
 * );
 * // joined.json contains the merged request
 * ```
 */
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
    for (let i = 0; i < criteria.length; i++) {
      const criterion = criteria[i]
      if (criterion?._type === CriteriaGroupType.OR_GROUP || criterion?._type === CriteriaGroupType.AND_GROUP) {
        const updatedCriterion = fillRequestWithNewRequest(criterion as RequeteurGroupType)
        if (updatedCriterion) {
          criteria[i] = updatedCriterion
        }
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
