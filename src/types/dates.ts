export enum CalendarRequestLabel {
  YEAR = 'an(s)',
  MONTH = 'mois',
  DAY = 'jour(s)',
  WEEK = 'semaine(s)',
  HOUR = 'heure(s)'
}

export type DurationType = {
  year: number | null
  month: number | null
  day: number | null
}
