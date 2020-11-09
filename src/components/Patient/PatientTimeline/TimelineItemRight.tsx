import React from 'react'

import { Chip } from '@material-ui/core'

import { IProcedure } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'

/**
 * @usage
 * <TimelineItemRight time={time} text={text} />
 */
type TimelineItemRightTypes = {
  data: IProcedure
  open: (procedure?: IProcedure) => void
}
const TimelineItemRight: React.FC<TimelineItemRightTypes> = ({ data, open }) => {
  let color = 'red'
  switch (data.status) {
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
            {data.performedDateTime
              ? new Date(data.performedDateTime).toLocaleDateString('fr-FR')
              : data.meta?.lastUpdated
              ? new Date(data.meta.lastUpdated).toLocaleDateString('fr-FR')
              : 'Date inconnue'}
          </span>
          {data.status && <Chip label={data.status} size="small" className={classes.chip} />}
          {data.code && (
            <div className={classes.timelineTextRight} onClick={() => open(data)}>
              {`${data.code?.coding?.[0].display} (${data.code?.coding?.[0].code})`}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default TimelineItemRight
