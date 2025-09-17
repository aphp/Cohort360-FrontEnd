import { Condition, Procedure } from 'fhir/r4'
import { CohortEncounter } from 'types'

export type TimelineMonthItem<T> = {
  data: T
  start?: string
  end?: string
}

export type TimelineMonth = {
  hospit: TimelineMonthItem<CohortEncounter>[]
  pmsi: TimelineMonthItem<Procedure | Condition>[]
}

export type YearData = Array<Record<number, TimelineMonth>>
export type TimelineOutput = Array<Record<number, YearData | []>>
