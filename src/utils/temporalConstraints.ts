/**
 * @fileoverview Utility functions for temporal constraints and criteria group selection
 * @module utils/temporalConstraints
 */

import { CriteriaGroup, CriteriaGroupType } from 'types'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'

/**
 * Criteria types that do not enable the temporal constraints button
 */
export const CRITERIA_TYPES_WITHOUT_TEMPORAL_CONSTRAINT: CriteriaType[] = [CriteriaType.IPP_LIST, CriteriaType.PATIENT]

/**
 * Criteria types never proposed in the temporal constraints lists (stay and chronological constraints)
 */
export const CRITERIA_TYPES_WITHOUT_STAY: CriteriaType[] = [
  ...CRITERIA_TYPES_WITHOUT_TEMPORAL_CONSTRAINT,
  CriteriaType.OBSERVATION
]

/**
 * Filters criteria groups to get AND groups that contain at least 2 selectable criteria
 *
 * @param selectedCriteria - Array of selected criteria to filter
 * @param criteriaGroups - Array of criteria groups to process
 * @param isEpisode - Whether to filter for episode-specific criteria (pregnancy/hospit)
 * @param excludedTypes - Criteria types excluded when not in episode mode (stay constraints by default)
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
  isEpisode?: boolean,
  excludedTypes: CriteriaType[] = CRITERIA_TYPES_WITHOUT_STAY
) => {
  const selectableCriteria = selectedCriteria
    .filter(({ type }) =>
      isEpisode ? type === CriteriaType.PREGNANCY || type === CriteriaType.HOSPIT : !excludedTypes.includes(type)
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
