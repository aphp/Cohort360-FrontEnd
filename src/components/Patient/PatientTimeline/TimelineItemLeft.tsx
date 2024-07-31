import React from 'react'
import Card from '@mui/material/Card'
import { Chip } from '@mui/material'

import useStyles from './styles'
import { CohortEncounter } from 'types'
import { Encounter } from 'fhir/r4'

/**
 * @usage
 * <TimelineItemLeft time={time} text={text} />
 */

type TimelineItemLeftTypes = {
  data: CohortEncounter
  open: (encounter?: Encounter) => void
  dotHeight: number
}
const TimelineItemLeft: React.FC<TimelineItemLeftTypes> = ({ data, open, dotHeight }) => {
  let color = ''
  switch (data?.class?.code) {
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

  const { classes } = useStyles({ dotHeight: dotHeight, color: color })
  const periodStart = data.period?.start ? new Date(data.period.start).toLocaleDateString('fr-FR') : '-'
  const periodEnd = data.period?.end ? new Date(data.period.end).toLocaleDateString('fr-FR') : '-'
  return (
    <>
      <div className={classes.timelineElementsLeft}>
        <i className={classes.dotLeft} />
        <div className={classes.lineLeft} />
      </div>
      <li className={classes.timelineItem}>
        <Card className={classes.leftHospitCard} variant="outlined">
          <div>
            {data.documents && data.documents.length > 0 && (
              <button className={classes.detailsButton} onClick={() => open(data)}>
                + de détails
              </button>
            )}
            {data.serviceProvider?.display && (
              <Chip label={data.serviceProvider.display} size="small" className={classes.chip} />
            )}
            <div className={classes.hospitText}>
              <div className={classes.hospitTitle}>{data.class ? data.class.display : 'classe inconnue'}</div>
              {data?.class?.code === 'ext' ? (
                <div className={classes.hospitDates}>
                  {data.period?.start ? `Le ${new Date(data.period.start).toLocaleDateString('fr-FR')}` : 'Pas de date'}
                </div>
              ) : (
                <div className={classes.hospitDates}>{`Du ${periodStart} au ${periodEnd}`}</div>
              )}
            </div>
          </div>
        </Card>
      </li>
    </>
  )
}

export default TimelineItemLeft
