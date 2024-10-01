import moment from 'moment'
import { DurationRangeType } from 'types/searchCriterias'

export const getDurationRangeLabel = (value: DurationRangeType) => {
  const before = value[0] ? moment(value[0]).format('DD/MM/YYYY') : null
  const after = value[1] ? moment(value[1]).format('DD/MM/YYYY') : null
  if (before && after) return `Entre le ${before} et le ${after}`
  if (before) return `Après le ${before} `
  if (after) return `Avant le ${after} `
  return ''
}

export const mapToDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}
