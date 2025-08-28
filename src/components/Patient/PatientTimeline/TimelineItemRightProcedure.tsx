import React from 'react'

import useStyles from './styles'
import { Procedure } from 'fhir/r4'

/**
 * @usage
 * <TimelineItemRight time={time} text={text} />
 */
type TimelineItemRightTypes = {
  date?: string
  description?: string
  status?: Procedure['status']
}
const TimelineItemRight = ({ date, description, status }: TimelineItemRightTypes) => {
  let color = 'red'
  switch (status) {
    case 'preparation':
    case 'on-hold':
    case 'in-progress':
      color = '#EDB88B'
      break
    case 'stopped':
    case 'entered-in-error':
    case 'unknown':
    case 'not-done':
      color = '#EF3E36'
      break
    case 'completed':
      color = '#17DEBB'
      break
    default:
      color = '#17DEBB'
      break
  }

  const { classes } = useStyles({ color: color })

  return (
    <li className={classes.timelineItem}>
      <div className={classes.timelineRightContent}>
        procedure
        <div className={classes.timelineElementsRight}>
          <i className={classes.dotRight} />
          <div className={classes.lineRight} />
        </div>
        <div className={classes.timelineRight}>
          <span className={classes.time}>{date ? new Date(date).toLocaleDateString('fr-Fr') : 'Date inconnue'}</span>
          {description && <div className={classes.timelineTextRight}>{description}</div>}
        </div>
      </div>
    </li>
  )
}

export default TimelineItemRight
