/**
 * @fileoverview Utility functions for grouping versions by date
 * @module utils/groupByDate
 */

import moment from 'moment'
import { QuerySnapshotInfo } from 'types'

/**
 * Groups query snapshot versions by their creation date and sorts them in descending order
 *
 * @param versions - Array of query snapshot versions to group
 * @returns Array of tuples containing formatted date strings and their corresponding versions, sorted by date (newest first)
 *
 * @example
 * ```typescript
 * const versions = [
 *   { created_at: '2023-12-25T10:00:00Z', version: 1 },
 *   { created_at: '2023-12-25T14:00:00Z', version: 2 },
 *   { created_at: '2023-12-24T09:00:00Z', version: 3 }
 * ]
 * groupVersionsByDate(versions)
 * // returns [
 * //   ['25/12/2023', [version1, version2]],
 * //   ['24/12/2023', [version3]]
 * // ]
 * ```
 */
export const groupVersionsByDate = (versions: QuerySnapshotInfo[]) => {
  const grouped = versions.reduce((acc, version) => {
    const date = moment(version.created_at).format('DD/MM/YYYY')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(version)
    return acc
  }, {} as Record<string, QuerySnapshotInfo[]>)

  // Tri des dates par ordre décroissant
  return Object.entries(grouped).sort(([a], [b]) => {
    return moment(b, 'DD/MM/YYYY').valueOf() - moment(a, 'DD/MM/YYYY').valueOf()
  })
}
