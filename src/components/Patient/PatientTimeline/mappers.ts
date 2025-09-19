import { getConfig } from 'config'
import { Procedure, Condition } from 'fhir/r4'
import { CohortEncounter, PMSIEntry } from 'types'
import { LabelObject } from 'types/searchCriterias'
import { getExtension } from 'utils/fhir'
import moment from 'moment'
import { TimelineMonth, TimelineOutput, YearData } from './types'

const getTimelineFormattedDataItem = (item: CohortEncounter | PMSIEntry<Procedure> | PMSIEntry<Condition>) => {
  const dataItem: {
    start?: string
    end?: string
  } = {}
  let date = moment()
  const dateFormat = 'YYYY-MM-DD'
  if (item.resourceType === 'Encounter') {
    date = moment(item.period?.start ?? item.meta?.lastUpdated, dateFormat)
  } else if (item.resourceType === 'Procedure') {
    date = moment(item.performedDateTime ?? item.meta?.lastUpdated, dateFormat)
  } else {
    date = moment(item.recordedDate ?? item.meta?.lastUpdated, dateFormat)
  }
  const yearStr = date.format('YYYY')
  const monthStr = date.format('MM')
  dataItem.start = date.format(dateFormat)
  if (item.resourceType === 'Encounter' && item.period?.end) {
    dataItem.end = moment(item.period.end, dateFormat).format(dateFormat)
  }
  return { dataItem, yearStr, monthStr }
}

export const generateTimelineFormattedData = (
  encounterStatusIds: string[],
  hospits?: CohortEncounter[],
  procedures?: PMSIEntry<Procedure>[],
  diagnostics?: PMSIEntry<Condition>[],
  selectedTypes?: LabelObject[]
): TimelineOutput => {
  const data: Record<string, Record<string, TimelineMonth>> = {}

  const normMonth = (monthStr: string | number) => String(Number(monthStr))

  const addItem = <T extends CohortEncounter | PMSIEntry<Procedure> | PMSIEntry<Condition>>(
    item: T,
    type: 'hospit' | 'pmsi'
  ) => {
    const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
    const monthKey = normMonth(monthStr)
    data[yearStr] ??= {}
    data[yearStr][monthKey] ??= { hospit: [], pmsi: [] }

    if (type === 'hospit') {
      data[yearStr][monthKey].hospit.push({ ...dataItem, data: item as CohortEncounter })
    } else {
      data[yearStr][monthKey].pmsi.push({ ...dataItem, data: item as Procedure | Condition })
    }
  }

  hospits
    ?.filter((item) => (encounterStatusIds.length > 0 ? encounterStatusIds.includes(item.status) : true))
    .forEach((item) => addItem(item, 'hospit'))

  procedures
    ?.filter((item) => item.code?.coding?.[0].display !== 'No matching concept')
    .forEach((item) => addItem(item, 'pmsi'))

  diagnostics = diagnostics?.filter((item) =>
    selectedTypes && selectedTypes.length > 0
      ? !!selectedTypes.find(
          (selectedType) =>
            selectedType.id ===
            getExtension(
              item,
              getConfig().features.condition.extensions.orbisStatus
            )?.valueCodeableConcept?.coding?.find(
              (elem) => elem?.system === getConfig().features.condition.valueSets.conditionStatus.url
            )?.code
        )
      : true
  )
  diagnostics = diagnostics?.filter((item) => item.code?.coding?.[0].display !== 'No matching concept')
  diagnostics?.forEach((item) => addItem(item, 'pmsi'))

  const years = Object.keys(data)
    .map(Number)
    .filter((y) => !isNaN(y))

  if (years.length === 0) return []

  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const result: TimelineOutput = []
  let emptyStart: number | null = null

  for (let year = maxYear; year >= minYear; year--) {
    const yKey = String(year)
    const yearData = data[yKey]

    if (!yearData || Object.keys(yearData).length === 0) {
      emptyStart = year
      if (year === minYear) {
        result.push({ [emptyStart]: [] })
      }
    } else {
      if (emptyStart !== null) {
        result.push({ [emptyStart]: [] })
        emptyStart = null
      }

      const months: YearData = Object.entries(yearData)
        .map(([month, value]) => [Number(month), value] as const)
        .sort((a, b) => b[0] - a[0])
        .map(([month, value]) => ({ [month]: value }))

      result.push({ [year]: months })
    }
  }
  result.unshift({ [maxYear + 1]: [] })

  return result
}
