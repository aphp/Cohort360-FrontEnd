/**
 * @fileoverview Utility functions for temporal constraints and criteria group selection
 * @module utils/temporalConstraints
 */

import { CriteriaGroup, CriteriaGroupType } from 'types'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

/**
 * Criteria types that carry neither a date nor a stay (Démographie, Liste d'IPP)
 */
export const CRITERIA_TYPES_WITHOUT_TEMPORAL_CONSTRAINT: CriteriaType[] = [CriteriaType.IPP_LIST, CriteriaType.PATIENT]

/**
 * Criteria types excluded from temporal constraints (Démographie, Liste d'IPP, Biologie):
 * they do not count to enable the temporal constraints button and are never proposed
 * in the stay or chronological constraints lists
 */
export const CRITERIA_TYPES_WITHOUT_STAY: CriteriaType[] = [
  ...CRITERIA_TYPES_WITHOUT_TEMPORAL_CONSTRAINT,
  CriteriaType.OBSERVATION
]

/**
 * Filters criteria groups to get AND groups that contain at least 2 selectable criteria
 * (not of a type listed in CRITERIA_TYPES_WITHOUT_STAY, or pregnancy/hospit in episode mode)
 *
 * @param selectedCriteria - Array of selected criteria to filter
 * @param criteriaGroups - Array of criteria groups to process
 * @param isEpisode - Whether to filter for episode-specific criteria (pregnancy/hospit)
 * @returns Array of criteria groups that meet the selectable criteria requirements
 *
 * @example
 * ```typescript
 * const selectableGroups = getSelectableGroups(
 *   selectedCriteria,
 *   criteriaGroups,
 *   false
 * );
 * ```
 */
export const getSelectableGroups = (
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroups: CriteriaGroup[],
  isEpisode?: boolean
) => {
  const selectableCriteria = selectedCriteria
    .filter(({ type }) =>
      isEpisode
        ? type === CriteriaType.PREGNANCY || type === CriteriaType.HOSPIT
        : !CRITERIA_TYPES_WITHOUT_STAY.includes(type)
    )
    .map((criteria) => criteria.id)
  const andGroupsWithSelectableCriteria = criteriaGroups
    .filter(({ type }) => type === CriteriaGroupType.AND_GROUP)
    .map((group) => {
      return { ...group, criteriaIds: group.criteriaIds.filter((id) => selectableCriteria.includes(id)) }
    })
  const selectableGroups = andGroupsWithSelectableCriteria.filter((group) => group.criteriaIds.length >= 2)

  return selectableGroups
}
