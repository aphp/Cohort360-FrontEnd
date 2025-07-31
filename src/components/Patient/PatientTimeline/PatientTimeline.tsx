/* eslint-disable max-statements */
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import moment from 'moment'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import Button from 'components/ui/Button'
import CriteriasSection from 'components/ExplorationBoard/CriteriasSection'
import TimelineItemRightProcedure from './TimelineItemRightProcedure'
import TimelineItemRightCondition from './TimelineItemRightCondition'
import TimelineItemLeft from './TimelineItemLeft'
import HospitDialog from './HospitDialog/HospitDialog'
import FilterTimelineDialog from './FilterTimelineDialog/FilterTimelineDialog'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import FilterList from 'assets/icones/filter.svg?react'

import { CohortComposition, CohortEncounter, PMSIEntry } from 'types'

import { useAppDispatch } from 'state'
import { fetchAllProcedures } from 'state/patient'

import useStyles from './styles'
import { Condition, Encounter, Period, Procedure } from 'fhir/r4'
import { FilterKeys, FilterValue, LabelObject, SearchCriteriaKeys, TimelineFilter } from 'types/searchCriterias'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { GAP } from 'types/exploration'
import { removeElementInArray, selectFiltersAsArray } from 'utils/filters'

const dateFormat = 'YYYY-MM-DD'

type MonthVisit = {
  hospit: {
    start?: string
    end?: string
    data: Encounter | CohortEncounter
  }[]
  pmsi: {
    start?: string
    end?: string
    data: PMSIEntry<Procedure | Condition>
  }[]
}

type TimelineData = {
  [yearStr: string]: {
    [monthStr: string]: MonthVisit
  }
}

const getTimelineFormattedDataItem = (item: CohortEncounter | PMSIEntry<Procedure> | PMSIEntry<Condition>) => {
  const dataItem: {
    start?: string
    end?: string
  } = {}
  let date = moment()
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

const generateTimelineFormattedData = (
  encounterStatusIds: string[],
  hospits?: CohortEncounter[],
  consults?: PMSIEntry<Procedure>[],
  diagnostics?: PMSIEntry<Condition>[],
  selectedTypes?: LabelObject[]
): TimelineData => {
  const data: TimelineData = {}

  hospits = hospits?.filter((item) => (encounterStatusIds.length > 0 ? encounterStatusIds.includes(item.status) : item))

  hospits?.forEach((item) => {
    const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
    data[yearStr] = data[yearStr] ?? {}
    data[yearStr][monthStr] = data[yearStr][monthStr] ?? {
      hospit: [],
      pmsi: []
    }
    data[yearStr][monthStr].hospit.push({ ...dataItem, data: item })
  })
  consults
    ?.filter((item) => item.code?.coding?.[0].display !== 'No matching concept')
    .forEach((item) => {
      const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
      data[yearStr] = data[yearStr] ?? {}
      data[yearStr][monthStr] = data[yearStr][monthStr] ?? {
        hospit: [],
        pmsi: []
      }
      data[yearStr][monthStr].pmsi.push({ ...dataItem, data: item })
    })
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
  diagnostics?.forEach((item) => {
    const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
    data[yearStr] = data[yearStr] ?? {}
    data[yearStr][monthStr] = data[yearStr][monthStr] ?? {
      hospit: [],
      pmsi: []
    }
    data[yearStr][monthStr].pmsi.push({ ...dataItem, data: item })
  })

  return data
}

/**
 * Converts array of events in to object having date as the key and list of
 * event for that date as the value
 *
 * @param {Array} hospit Array of events in the form of ts and text
 * @param {Array} consult Array of events in the form of ts and text
 * @returns {Object} return object with key as date and values array in events for that date
 */

type PatientTimelineTypes = {
  loadingPmsi: boolean
  deidentified: boolean
  hospits?: CohortEncounter[]
  consults?: Procedure[]
  diagnostics?: Condition[]
}
const PatientTimeline: React.FC<PatientTimelineTypes> = ({
  loadingPmsi,
  deidentified,
  hospits,
  consults,
  diagnostics
}) => {
  const dispatch = useAppDispatch()
  const { classes } = useStyles({})
  const [searchParams, setSearchParams] = useSearchParams()
  const [timelineData, setTimelineData] = useState<TimelineData>({})
  const [openHospitDialog, setOpenHospitDialog] = useState(false)
  const [dialogDocuments, setDialogDocuments] = useState<CohortComposition[] | undefined>([])
  const [openFilter, setOpenFilter] = useState(false)

  const [diagnosticTypesList, setDiagnosticTypesList] = useState<LabelObject[]>([])
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const [filters, setFilters] = useState<TimelineFilter>({
    diagnosticTypes: [],
    encounterStatus: []
  })
  const [loading, setLoading] = useState(false)
  const yearComponentSize: { [year: number]: number } = {}

  const groupId = searchParams.get('groupId') ?? undefined

  const { patientId } = useParams<{ patientId: string }>()

  useEffect(() => {
    setSearchParams({ ...(groupId && getCleanGroupId(groupId) && { groupId: getCleanGroupId(groupId) }) })

    dispatch(
      fetchAllProcedures({
        // @ts-ignore
        patientId,
        groupId
      })
    )
  }, [])

  useEffect(() => {
    const _fetch = async () => {
      const [diagnosticTypes, encounterStatus] = await Promise.all([
        getCodeList(getConfig().features.condition.valueSets.conditionStatus.url),
        getCodeList(getConfig().core.valueSets.encounterStatus.url)
      ])
      if (!diagnosticTypes) return

      setEncounterStatusList(encounterStatus.results)
      // Find main diagnosis
      const foundItem = diagnosticTypes.results.find((diagnosticTypes) => diagnosticTypes.id === 'dp')
      // foundItem && setSelectedTypes([foundItem])
      const foundItemAsLabelObject = foundItem ? [{ id: foundItem.id, label: foundItem.label }] : []
      setFilters({ ...filters, diagnosticTypes: foundItemAsLabelObject })
      setDiagnosticTypesList(diagnosticTypes.results)
    }

    _fetch()
  }, [])

  useEffect(() => {
    const encounterStatusIds = filters.encounterStatus.map(({ id }) => id)
    const _timelineData = generateTimelineFormattedData(
      encounterStatusIds,
      hospits,
      consults,
      diagnostics,
      filters.diagnosticTypes
    )
    setTimelineData(_timelineData)
  }, [hospits, consults, diagnostics, filters])

  let yearList: number[] = timelineData
    ? Object.keys(timelineData)
        .map((key) => parseInt(key))
        .filter((elem) => !isNaN(elem))
        .reverse()
    : []

  const timelinePeriod = {
    start: yearList[yearList.length - 1],
    end: yearList[0] + 1
  }

  if (yearList.length > 0) {
    yearList = Array.from(
      new Array(timelinePeriod.end - timelinePeriod.start + 1),
      (x, i) => i + timelinePeriod.start
    ).reverse()
  }

  const handleClickOpenHospitDialog = async (hospitOrConsult?: CohortEncounter | PMSIEntry<Procedure>) => {
    if (hospitOrConsult) {
      setLoading(true)
      setOpenHospitDialog(true)
      const docs = hospitOrConsult.documents
      setDialogDocuments(docs)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpenHospitDialog(false)
  }

  const isActivityInYear = (yearSearched: number) => {
    // function that check if there are activities during {yearSearched} to create a year component or not
    const isHospitDuringYearSearched = (hospit: { start?: string | undefined; end?: string | undefined }) =>
      new Date(hospit.start ?? '').getFullYear() <= yearSearched &&
      new Date(hospit.end ?? '').getFullYear() >= yearSearched

    const isConsultDuringYearSearched = (consult: { start?: string | undefined; end?: string | undefined }) =>
      new Date(consult.start ?? '').getFullYear() === yearSearched

    return timelineData
      ? Object.keys(timelineData).some((year) =>
          Object.keys(timelineData[year]).some(
            (month) =>
              timelineData[year][month].hospit.some((hospit) => isHospitDuringYearSearched(hospit)) ||
              timelineData[year][month].pmsi.some((pmsi) => isConsultDuringYearSearched(pmsi))
          )
        )
      : false
  }

  const getMonthComponent = (monthVisits: MonthVisit) => {
    const getComponentSize = (period?: Period) => {
      // get the size of the hospit dot
      if (period) {
        if (period.end) {
          let size = 45 // 45px for the current year

          for (
            let i = new Date(period.start ?? '').getFullYear() + 1;
            // +1 because we don't consider the first year component size (45px taken into account)
            i <= new Date(period.end).getFullYear() - 1;
            // -1 because we don't consider the last year component size because we want it to stop during this last year
            i++
          ) {
            size += yearComponentSize[i] ?? 0
          }
          return size
        } else {
          return 16
        }
      } else {
        return 16
      }
    }

    return (
      <>
        {monthVisits.hospit && (
          <div className={classes.leftElements}>
            {monthVisits.hospit.map((hospit, index) => (
              <TimelineItemLeft
                key={`encounter ${hospit.data.id ?? index}`}
                data={hospit.data}
                open={handleClickOpenHospitDialog}
                dotHeight={getComponentSize(hospit.data.period)}
              />
            ))}
          </div>
        )}
        {monthVisits.pmsi && (
          <div className={classes.rightElements}>
            {monthVisits.pmsi.map((pmsi, index) =>
              pmsi.data.resourceType === 'Procedure' ? (
                <TimelineItemRightProcedure key={`procedure ${index}`} data={pmsi.data} />
              ) : (
                <TimelineItemRightCondition key={`condition ${index}`} data={pmsi.data} />
              )
            )}
          </div>
        )}
      </>
    )
  }

  const getYearComponent = (year: number) => (
    <React.Fragment>
      {timelineData[year]
        ? Object.keys(timelineData[year]).map((month) => (
            <ul className={classes.timeline} key={'ul' + year + month}>
              {getMonthComponent(timelineData[year][month])}
            </ul>
          ))
        : isActivityInYear(year) && <div className={classes.emptyYear}></div>}
      <span className={classes.timelabel}>{year}</span>
    </React.Fragment>
  )

  const handleDeleteChip = (key: FilterKeys | SearchCriteriaKeys, value: FilterValue) => {
    switch (key) {
      case FilterKeys.DIAGNOSTIC_TYPES: {
        const selectedDiagnosticTypes = removeElementInArray(filters.diagnosticTypes, value as LabelObject)
        setFilters({ ...filters, diagnosticTypes: selectedDiagnosticTypes })
        break
      }
      case FilterKeys.ENCOUNTER_STATUS: {
        const selectedEncounterStatus = removeElementInArray(filters.encounterStatus, value as LabelObject)
        setFilters({ ...filters, encounterStatus: selectedEncounterStatus })
        break
      }
      default:
        break
    }
  }

  const filtersAsArray = useMemo(() => selectFiltersAsArray(filters, undefined), [filters])

  return (
    <>
      {hospits && consults && hospits.length === 0 && consults.length === 0 ? (
        <Grid container sx={{ justifyContent: 'center' }}>
          <Typography variant="button">Le patient n'a pas de visites à afficher.</Typography>
        </Grid>
      ) : (
        <>
          <HospitDialog
            open={openHospitDialog}
            onClose={handleClose}
            loading={loading}
            documents={dialogDocuments}
            deidentified={deidentified}
          />

          <FilterTimelineDialog
            diagnosticTypesList={diagnosticTypesList}
            selectedDiagnosticTypes={filters.diagnosticTypes}
            onChangeFilters={(newFilters: TimelineFilter) => setFilters(newFilters)}
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            encounterStatusList={encounterStatusList}
            selectedEncounterStatus={filters.encounterStatus}
          />

          <Grid container sx={{ gap: GAP }} margin={'16px 0'}>
            <Button
              onClick={() => setOpenFilter(true)}
              startIcon={<FilterList height="15px" fill="#FFF" />}
              width="fit-content"
            >
              Filtrer
            </Button>

            <CriteriasSection
              value={filtersAsArray}
              displayOptions={{
                myFilters: false,
                filterBy: true,
                orderBy: false,
                saveFilters: false,
                criterias: true,
                search: false,
                diagrams: false,
                count: false,
                sidebar: false
              }}
              onDelete={handleDeleteChip}
            />

            {loadingPmsi && (
              <div className={classes.loadingContainer}>
                <CenteredCircularProgress size={25} />
              </div>
            )}

            <div className={classes.centeredTimeline}>
              <div className={classes.verticalBar} />
              {yearList.map((year) => (
                <div
                  key={'generalTimelineDiv' + year}
                  ref={(el) => {
                    if (!el) return
                    const sizeValue = el.getBoundingClientRect().height
                    if (yearComponentSize[year] === sizeValue) return

                    yearComponentSize[year] = sizeValue
                  }}
                >
                  {isActivityInYear(year) || year === timelinePeriod.end
                    ? getYearComponent(year)
                    : isActivityInYear(year - 1) && (
                        <>
                          <span className={classes.collapsedYear}>
                            <MoreVertIcon />
                          </span>
                          <span className={classes.timelabel}>{year}</span>
                        </>
                      )}
                </div>
              ))}
            </div>
          </Grid>
        </>
      )}
    </>
  )
}

export default PatientTimeline
