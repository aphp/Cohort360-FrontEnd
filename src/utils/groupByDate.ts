import moment from 'moment'
import { QuerySnapshotInfo } from 'types'

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
