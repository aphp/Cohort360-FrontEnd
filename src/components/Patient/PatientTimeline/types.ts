import { Condition, Procedure } from 'fhir/r4'
import { CohortEncounter, PMSIEntry } from 'types'

export enum TimelineType {
  HOSPIT,
  PROCEDURE,
  CONDITION
}

export type TimelineMonthItem<T> = {
  data: T
  type: TimelineType
  start?: string
  end?: string
}

export type TimelineMonth = TimelineMonthItem<CohortEncounter | PMSIEntry<Procedure> | PMSIEntry<Condition>>[]
export type YearData = Array<Record<number, TimelineMonth>>
export type TimelineOutput = Array<Record<number, YearData | []>>
