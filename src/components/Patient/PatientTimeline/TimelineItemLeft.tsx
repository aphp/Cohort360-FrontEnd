import React from 'react'
import Card from '@material-ui/core/Card'
import { Chip } from '@material-ui/core'

import useStyles from './styles'
import { IEncounter } from '@ahryman40k/ts-fhir-types/lib/R4'

/**
 * @usage
 * <TimelineItemLeft time={time} text={text} />
 */

type TimelineItemLeftTypes = {
  data: IEncounter
  open: (encounter?: IEncounter) => void
  dotHeight: number
}
const TimelineItemLeft: React.FC<TimelineItemLeftTypes> = ({ data, open, dotHeight }) => {
  let color = ''
  switch (data?.class.code) {
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

  const classes = useStyles({ dotHeight: dotHeight, color: color })
  return (
    <>
      <div className={classes.timelineElementsLeft}>
        <i className={classes.dotLeft} />
        <div className={classes.lineLeft} />
      </div>
      <li className={classes.timelineItem}>
        <Card className={classes.leftHospitCard} variant="outlined">
          <div>
            <span className={classes.detailsButton} onClick={() => open(data)}>
              + de détails
            </span>
            {data.serviceProvider?.display && (
              <Chip label={data.serviceProvider.display} size="small" className={classes.chip} />
            )}
            <div className={classes.hospitText}>
              <div className={classes.hospitTitle}>
                {data.class ? data.class.display : 'classe inconnue'}
                {/* {` ${
                  data.diagnosis
                    ? data.diagnosis[0].condition.display
                    : ''
                }`} */}
              </div>
              <div className={classes.hospitDates}>
                {data.period?.start
                  ? `Du ${new Date(data.period.start).toLocaleDateString('fr-FR')} au ${
                      data.period.end ? new Date(data.period.end).toLocaleDateString('fr-FR') : '-'
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

export default TimelineItemLeft
