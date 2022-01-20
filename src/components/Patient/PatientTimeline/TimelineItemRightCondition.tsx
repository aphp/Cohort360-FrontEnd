import React from 'react'

import { ICondition } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'
import { PMSIEntry } from 'types'

/**
 * @usage
 * <TimelineItemRight time={time} text={text} />
 */
type TimelineItemRightTypes = {
  data: PMSIEntry<ICondition>
}
const TimelineItemRight: React.FC<TimelineItemRightTypes> = ({ data }) => {
  const classes = useStyles({ color: '#b7c3d9' })

  return (
    <li className={classes.timelineItem}>
      <div className={classes.timelineRightContent}>
        <div className={classes.timelineElementsRight}>
          <i className={classes.dotRight} />
          <div className={classes.lineRight} />
        </div>
        <div className={classes.timelineRight}>
          <span className={classes.time}>
            {data.recordedDate
              ? new Date(data.recordedDate).toLocaleDateString('fr-FR')
              : data.meta?.lastUpdated
              ? new Date(data.meta.lastUpdated).toLocaleDateString('fr-FR')
              : 'Date inconnue'}
          </span>

          {data.code && (
            <div className={classes.timelineTextRight}>
              {`${data.code?.coding?.[0].display} (${data.code?.coding?.[0].code})`}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default TimelineItemRight
