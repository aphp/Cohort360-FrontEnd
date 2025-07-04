import UpdateIcon from '@mui/icons-material/Update'
import { ChipStatus } from 'components/ui/StatusChip'
import { JobStatus } from 'types'

export const mapJobStatus = (status?: JobStatus, jobFailMessage?: string) => {
  if (jobFailMessage) {
    return { label: 'Erreur', status: ChipStatus.ERROR, tooltip: jobFailMessage }
  }

  switch (status) {
    case JobStatus.FINISHED:
      return { label: 'Terminé', status: ChipStatus.FINISHED }
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
