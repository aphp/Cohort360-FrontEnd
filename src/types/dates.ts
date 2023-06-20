export enum Calendar {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day'
}

export enum CalendarLabel {
  YEAR = 'années',
  MONTH = 'mois',
  DAY = 'jours'
}

export enum CalendarRequestLabel {
  YEAR = 'an(s)',
  MONTH = 'mois',
  DAY = 'jour(s)'
}

export type DurationType = {
  year: number | null
  month: number | null
  day: number | null
}
