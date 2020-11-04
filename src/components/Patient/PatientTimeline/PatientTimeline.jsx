import React from 'react'

import PropTypes from 'prop-types'
import moment from 'moment'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import TimelineItemRight from './TimelineItemRight'
import TimelineItemLeft from './TimelineItemLeft'
import HospitDialog from './HospitDialog/HospitDialog'

import MoreVertIcon from '@material-ui/icons/MoreVert'
import useStyles from './style'

/**
 * Converts array of events in to object having date as the key and list of
 * event for that date as the value
 *
 * @param {Array} hospit Array of events in the form of ts and text
 * @param {Array} consult Array of events in the form of ts and text
 * @returns {Object} return object with key as date and values array in events for that date
 */

const PatientTimeline = ({ documents, hospits, consults }) => {
  const classes = useStyles()
  const dateFormat = 'YYYY-MM-DD'

  const [openHospitDialog, setOpenHospitDialog] = React.useState(false)

  const monthComponentSize = {}
  const [yearComponentSize, setYearComponentSize] = React.useState({})

  const timelineData = {}

  const generateTimelineFormattedData = (item, isHospit) => {
    if (item.resource_type !== 'OperationOutcome') {
      const date = moment(
        item.period?.start ? item.period.start : item.meta.lastUpdated,
        dateFormat
      )
      const yearStr = date.format('YYYY')
      const monthStr = date.format('MM')
      timelineData[yearStr] = timelineData[yearStr] || {}
      timelineData[yearStr][monthStr] = timelineData[yearStr][monthStr] || {
        hospit: [],
        consult: []
      }
      item.start = date.format(dateFormat)
      if (item.period?.end) {
        item.end = moment(item.period.end, dateFormat).format(dateFormat)
      }
      isHospit
        ? timelineData[yearStr][monthStr].hospit.push(item)
        : timelineData[yearStr][monthStr].consult.push(item)
    }
  }

  if (hospits) {
    hospits.forEach((item) => generateTimelineFormattedData(item, true))
  }
  if (consults) {
    consults.forEach((item) => generateTimelineFormattedData(item, false))
  }

  let yearList = Object.keys(timelineData).reverse()

  const timelinePeriod = {
    start: parseInt(yearList[yearList.length - 1]),
    end: parseInt(yearList[0]) + 1
  }

  if (yearList.length > 0) {
    yearList = Array.from(
      new Array(timelinePeriod.end - timelinePeriod.start + 1),
      (x, i) => i + timelinePeriod.start
    ).reverse()
  }

  const isActivityInYear = (yearSearched) => {
    // function that check if there are activities during {yearSearched} to create a year component or not
    const isHospitDuringYearSearched = (hospit) =>
      new Date(hospit.start).getFullYear() <= yearSearched &&
      new Date(hospit.end).getFullYear() >= yearSearched

    const isConsultDuringYearSearched = (consult) =>
      new Date(consult.start).getFullYear() === yearSearched

    return Object.keys(timelineData).some((year) =>
      Object.keys(timelineData[year]).some(
        (month) =>
          timelineData[year][month].hospit.some((hospit) =>
            isHospitDuringYearSearched(hospit)
          ) ||
          timelineData[year][month].consult.some((consult) =>
            isConsultDuringYearSearched(consult)
          )
      )
    )
  }

  const getMonthComponent = (monthVisits) => {
    const getComponentSize = (period) => {
      // get the size of the hospit dot
      if (period) {
        if (period.end) {
          let size = 45 // 45px for the current year

          for (
            let i = new Date(period.start).getFullYear() + 1;
            // +1 because we don't consider the first year component size (45px taken into account)
            i <= new Date(period.end).getFullYear() - 1;
            // -1 because we don't consider the last year component size because we want it to stop during this last year
            i++
          ) {
            size += yearComponentSize[i] || 0
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
      <React.Fragment>
        {monthVisits.hospit && (
          <div className={classes.leftElements}>
            {monthVisits.hospit.map((hospit) => (
              <TimelineItemLeft
                key={hospit.id}
                data={hospit}
                open={handleClickOpenHospitDialog}
                dotHeight={getComponentSize(hospit.period)}
              />
            ))}
          </div>
        )}
        {monthVisits.consult && (
          <div className={classes.rightElements}>
            {monthVisits.consult.map((consult) => (
              <TimelineItemRight
                key={consult.id}
                data={consult}
                open={handleClickOpenHospitDialog}
              />
            ))}
          </div>
        )}
      </React.Fragment>
    )
  }

  const getYearComponent = (year) => (
    <React.Fragment>
      {timelineData[year]
        ? Object.keys(timelineData[year]).map((month) => (
            <ul
              className={classes.timeline}
              key={'ul' + year + month}
              ref={(el) => {
                // Setting component size in monthComponentSize
                if (!el) return
                monthComponentSize[year] = monthComponentSize[year] || []

                monthComponentSize[year][
                  month
                ] = el.getBoundingClientRect().height
              }}
            >
              {getMonthComponent(timelineData[year][month])}
            </ul>
          ))
        : isActivityInYear(year) && <div className={classes.emptyYear}></div>}
      <span className={classes.timelabel}>{parseInt(year)}</span>
    </React.Fragment>
  )

  const handleClickOpenHospitDialog = () => {
    setOpenHospitDialog(true)
  }

  const handleClose = () => {
    setOpenHospitDialog(false)
  }

  return (
    <React.Fragment>
      {!hospits && !consults ? (
        <Grid container justify="center">
          <Typography variant="button">
            Le patient n'a pas de visites à afficher.
          </Typography>
        </Grid>
      ) : (
        <>
          <HospitDialog
            open={openHospitDialog}
            onClose={handleClose}
            documents={documents}
          />
          <div className={classes.centeredTimeline}>
            <div className={classes.verticalBar}></div>
            {yearList.map((year) => (
              <div
                key={'generalTimelineDiv' + year}
                ref={(el) => {
                  if (!el) return
                  const sizeValue = el.getBoundingClientRect().height
                  if (yearComponentSize[year] === sizeValue) return

                  setYearComponentSize({
                    ...yearComponentSize,
                    [year]: sizeValue
                  })
                }}
              >
                {isActivityInYear(year) || year === timelinePeriod.end
                  ? getYearComponent(year)
                  : isActivityInYear(year - 1) && (
                      <React.Fragment>
                        <span className={classes.collapsedYear}>
                          <MoreVertIcon />
                        </span>
                        <span className={classes.timelabel}>
                          {parseInt(year)}
                        </span>
                      </React.Fragment>
                    )}
              </div>
            ))}
          </div>
        </>
      )}
    </React.Fragment>
  )
}

PatientTimeline.propTypes = {
  // Procedure on right part
  consults: PropTypes.arrayOf(
    PropTypes.shape({
      meta: PropTypes.shape({
        lastUpdated: PropTypes.string.isRequired
      }),
      code: PropTypes.shape({
        coding: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string }))
      }),
      status: PropTypes.string
    })
  ).isRequired,

  // Encounter on left part
  hospits: PropTypes.arrayOf(
    PropTypes.shape({
      meta: PropTypes.shape({
        lastUpdated: PropTypes.string.isRequired
      }),
      class: PropTypes.shape({ code: PropTypes.string.isRequired }),
      serviceProvider: PropTypes.shape({
        identifier: PropTypes.shape({ value: PropTypes.string.isRequired })
      }),
      period: PropTypes.shape({
        end: PropTypes.string,
        start: PropTypes.string.isRequired
      })
    })
  ).isRequired,

  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.object,
      description: PropTypes.string,
      status: PropTypes.string,
      docStatus: PropTypes.string,
      securityLabel: PropTypes.array,
      content: PropTypes.array
    }).isRequired
  )
}
export default PatientTimeline
