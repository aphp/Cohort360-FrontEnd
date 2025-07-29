/**
 * @fileoverview Utility functions for mapping job status to UI components
 * @module utils/status
 */

import UpdateIcon from '@mui/icons-material/Update'
import { ChipStatus } from 'components/ui/StatusChip'
import { JobStatus } from 'types'

/**
 * Maps a job status to its corresponding UI representation with label, status, and optional tooltip
 *
 * @param status - The job status to map
 * @param jobFailMessage - Optional failure message for error states
 * @returns Object containing label, status, and optional icon/tooltip for UI display
 *
 * @example
 * ```typescript
 * mapJobStatus(JobStatus.FINISHED)
 * // returns { label: 'Terminé', status: ChipStatus.FINISHED }
 *
 * mapJobStatus(JobStatus.FAILED, 'Network error')
 * // returns { label: 'Erreur', status: ChipStatus.ERROR, tooltip: 'Network error' }
 * ```
 */
export const mapJobStatus = (status?: JobStatus, jobFailMessage?: string) => {
  if (jobFailMessage) {
    return { label: 'Erreur', status: ChipStatus.ERROR, tooltip: jobFailMessage }
  }

  switch (status) {
    case JobStatus.FINISHED:
      return { label: 'Terminé', status: ChipStatus.FINISHED }
    case JobStatus.STARTED:
    case JobStatus.PENDING:
    case JobStatus.NEW:
      return { label: 'En cours', status: ChipStatus.IN_PROGRESS }
    case JobStatus.LONG_PENDING:
      return {
        label: 'En cours',
        status: ChipStatus.IN_PROGRESS,
        icon: UpdateIcon,
        tooltip:
          "Cohorte volumineuse : sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible."
      }
    default:
      return { label: 'Erreur', status: ChipStatus.ERROR }
  }
}
