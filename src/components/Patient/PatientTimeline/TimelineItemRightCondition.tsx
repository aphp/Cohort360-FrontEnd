import React from 'react'

import useStyles from './styles'
import { PMSIEntry } from 'types'
import { Condition } from 'fhir/r4'

/**
 * @usage
 * <TimelineItemRight time={time} text={text} />
 */
type TimelineItemRightTypes = {
  data: PMSIEntry<Condition>
  date?: string
  description?: string
}
const TimelineItemRight: React.FC<TimelineItemRightTypes> = ({ data, date, description }) => {
  const { classes } = useStyles({ color: '#b7c3d9' })

  return (
    <li className={classes.timelineItem}>
      <div className={classes.timelineRightContent}>
        condition
        <div className={classes.timelineElementsRight}>
          <i className={classes.dotRight} />
          <div className={classes.lineRight} />
        </div>
        <div className={classes.timelineRight}>
          <span className={classes.time}>
            <span className={classes.time}>{date ? new Date(date).toLocaleDateString('fr-Fr') : 'Date inconnue'}</span>
          </span>

          {data.code && (
            <div className={classes.timelineTextRight}>
              {description && <div className={classes.timelineTextRight}>{description}</div>}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default TimelineItemRight
