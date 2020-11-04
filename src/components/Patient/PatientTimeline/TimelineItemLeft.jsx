import React from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import { Chip } from '@material-ui/core'

import useStyles from './style'

/**
 * @usage
 * <TimelineItemLeft time={time} text={text} />
 */
const TimelineItemLeft = (props) => {
  let color = ''
  switch (props.data.class.code) {
    case 'hosp':
      color = '#C3DCA5'
      break
    case 'urg':
      color = '#FC568F'
      break
    case 'ext':
      color = '#FFE755'
      break
    case 'incomp':
      color = '#A7E5FF'
      break
    default:
      color = '#A7E5FF'
  }

  const classes = useStyles({ dotHeight: props.dotHeight, color: color })
  return (
    <>
      <div className={classes.timelineElementsLeft}>
        <i className={classes.dotLeft} />
        <div className={classes.lineLeft} />
      </div>
      <li className={`${classes.timelineItem} ${classes.timelineItemLeft}`}>
        <Card className={classes.leftHospitCard} variant="outlined">
          <div>
            <span className={classes.detailsButton} onClick={props.open}>
              + de détails
            </span>
            {props.data.serviceProvider.display && (
              <Chip
                label={props.data.serviceProvider.display}
                size="small"
                className={classes.chip}
              />
            )}
            <div className={classes.hospitText}>
              <div className={classes.hospitTitle}>
                {props.data.class
                  ? props.data.class.display
                  : 'classe inconnue'}
                {/* {` ${
                  props.data.diagnosis
                    ? props.data.diagnosis[0].condition.display
                    : ''
                }`} */}
              </div>
              <div className={classes.hospitDates}>
                {props.data.period
                  ? `Du ${new Date(props.data.period.start).toLocaleDateString(
                      'fr-FR'
                    )} au ${
                      props.data.period.end
                        ? new Date(props.data.period.end).toLocaleDateString(
                            'fr-FR'
                          )
                        : '-'
                    }`
                  : 'Pas de date'}
              </div>
            </div>
          </div>
        </Card>
      </li>
    </>
  )
}

TimelineItemLeft.defaultProps = {}

TimelineItemLeft.propTypes = {
  data: PropTypes.shape({
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
    }),
    diagnosis: PropTypes.array
  }).isRequired,
  open: PropTypes.func.isRequired,
  dotHeight: PropTypes.number
}

export default TimelineItemLeft
