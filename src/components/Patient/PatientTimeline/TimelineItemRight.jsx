import React from 'react'
import PropTypes from 'prop-types'
import { Chip } from '@material-ui/core'

import useStyles from './style'

/**
 * @usage
 * <TimelineItemRight time={time} text={text} />
 */
const TimelineItemRight = (props) => {
  let color = 'red'
  switch (props.data.status) {
    case ('preparation', 'in-progress', 'on-hold'):
      color = '#EDB88B'
      break
    case ('stopped', 'entered-in-error', 'unknown', 'not-done'):
      color = '#EF3E36'
      break
    case 'completed':
      color = '#17DEBB'
      break
    default:
      color = '#17DEBB'
      break
  }

  const classes = useStyles({ color: color })
  return (
    <li className={classes.timelineItem}>
      <div className={classes.timelineRightContent}>
        <div className={classes.timelineElementsRight}>
          <i className={classes.dotRight} />
          <div className={classes.lineRight} />
        </div>
        <div className={classes.timelineRight}>
          <span className={classes.time}>
            {props.data.performed
              ? new Date(props.data.start).toLocaleDateString('fr-FR')
              : new Date(props.data.meta.lastUpdated).toLocaleDateString(
                  'fr-FR'
                ) || 'unknown'}
          </span>
          {props.data.status && (
            <Chip
              label={props.data.status}
              size="small"
              className={classes.chip}
            />
          )}
          {props.data.code && (
            <div className={classes.timelineTextRight} onClick={props.open}>
              {`${props.data.code.coding[0].display} (${props.data.code.coding[0].code})`}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

TimelineItemRight.defaultProps = {}

TimelineItemRight.propTypes = {
  data: PropTypes.shape({
    meta: PropTypes.shape({
      lastUpdated: PropTypes.string.isRequired
    }),
    start: PropTypes.string,
    performed: PropTypes.string,
    code: PropTypes.shape({
      coding: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
      text: PropTypes.string
    }),
    status: PropTypes.string,
    location: PropTypes.shape({
      identifier: PropTypes.shape({ value: PropTypes.string }),
      display: PropTypes.string
    })
  }).isRequired,
  open: PropTypes.func.isRequired
}

export default TimelineItemRight
