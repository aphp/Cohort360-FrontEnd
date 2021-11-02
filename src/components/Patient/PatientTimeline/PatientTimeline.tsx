import React, { useState } from 'react'

import moment from 'moment'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import TimelineItemRight from './TimelineItemRight'
import TimelineItemLeft from './TimelineItemLeft'
import HospitDialog from './HospitDialog/HospitDialog'

import MoreVertIcon from '@material-ui/icons/MoreVert'

import { CohortComposition, CohortEncounter, PMSIEntry } from 'types'
import { IEncounter, IProcedure, IDocumentReference, IPeriod } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'

const dateFormat = 'YYYY-MM-DD'

type MonthVisit = {
  hospit: {
    start?: string
    end?: string
    data: IEncounter | CohortEncounter
  }[]
  consult: {
    start?: string
    end?: string
    data: PMSIEntry<IProcedure>
  }[]
}

type TimelineData = {
  [yearStr: string]: {
    [monthStr: string]: MonthVisit
  }
}

const getTimelineFormattedDataItem = (item: CohortEncounter | PMSIEntry<IProcedure>) => {
  const dataItem: {
    start?: string
    end?: string
  } = {}
  let date = moment()
  if (item.resourceType === 'Encounter') {
    date = moment(item.period?.start ?? item.meta?.lastUpdated, dateFormat)
  } else {
    date = moment(item.performedDateTime ?? item.meta?.lastUpdated, dateFormat)
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
  hospits?: CohortEncounter[],
  consults?: PMSIEntry<IProcedure>[]
): TimelineData => {
  const data: TimelineData = {}

  hospits?.forEach((item) => {
    const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
    data[yearStr] = data[yearStr] ?? {}
    data[yearStr][monthStr] = data[yearStr][monthStr] ?? {
      hospit: [],
      consult: []
    }
    data[yearStr][monthStr].hospit.push({ ...dataItem, data: item })
  })
  consults?.forEach((item) => {
    const { dataItem, monthStr, yearStr } = getTimelineFormattedDataItem(item)
    data[yearStr] = data[yearStr] ?? {}
    data[yearStr][monthStr] = data[yearStr][monthStr] ?? {
      hospit: [],
      consult: []
    }
    data[yearStr][monthStr].consult.push({ ...dataItem, data: item })
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
  deidentified: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  hospits?: CohortEncounter[]
  consults?: PMSIEntry<IProcedure>[]
}
const PatientTimeline: React.FC<PatientTimelineTypes> = ({ deidentified, hospits, consults }) => {
  const classes = useStyles()
  const timelineData = generateTimelineFormattedData(hospits, consults)
  const [openHospitDialog, setOpenHospitDialog] = useState(false)
  const [dialogDocuments, setDialogDocuments] = useState<(CohortComposition | IDocumentReference)[] | undefined>([])
  const [loading, setLoading] = useState(false)
  const yearComponentSize: { [year: number]: number } = {}

  let yearList: number[] = Object.keys(timelineData)
    .map((key) => parseInt(key))
    .reverse()

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

  const handleClickOpenHospitDialog = async (hospitOrConsult?: CohortEncounter | PMSIEntry<IProcedure>) => {
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

    return Object.keys(timelineData).some((year) =>
      Object.keys(timelineData[year]).some(
        (month) =>
          timelineData[year][month].hospit.some((hospit) => isHospitDuringYearSearched(hospit)) ||
          timelineData[year][month].consult.some((consult) => isConsultDuringYearSearched(consult))
      )
    )
  }

  const getMonthComponent = (monthVisits: MonthVisit) => {
    const getComponentSize = (period?: IPeriod) => {
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
                key={`ecounter ${hospit.data.id ?? index}`}
                data={hospit.data}
                open={handleClickOpenHospitDialog}
                dotHeight={getComponentSize(hospit.data.period)}
              />
            ))}
          </div>
        )}
        {monthVisits.consult && (
          <div className={classes.rightElements}>
            {monthVisits.consult.map((consult, index) => (
              <TimelineItemRight
                key={`procedure ${consult.data.id ?? index}`}
                data={consult.data}
                open={handleClickOpenHospitDialog}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  const getYearComponent = (year: number) => (
    <React.Fragment>
      {timelineData[year]
        ? Object.keys(timelineData[year]).map((month) => (
            <ul
              className={classes.timeline}
              key={'ul' + year + month}
              // ref={(el) => {
              //   // Setting component size in monthComponentSize
              //   if (!el) return
              //   monthComponentSize[year] = monthComponentSize[year] || []

              //   monthComponentSize[year][
              //     month
              //   ] = el.getBoundingClientRect().height
              // }}
            >
              {getMonthComponent(timelineData[year][month])}
            </ul>
          ))
        : isActivityInYear(year) && <div className={classes.emptyYear}></div>}
      <span className={classes.timelabel}>{year}</span>
    </React.Fragment>
  )

  return (
    <>
      {hospits && consults && hospits.length === 0 && consults.length === 0 ? (
        <Grid container justify="center">
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
        </>
      )}
    </>
  )
}

export default PatientTimeline
