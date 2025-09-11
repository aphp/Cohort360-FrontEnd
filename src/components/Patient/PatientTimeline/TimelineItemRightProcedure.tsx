import React from 'react'

import useStyles from './styles'
import { Procedure } from 'fhir/r4'
import { Box, Typography } from '@mui/material'

type TimelineItemRightTypes = {
  date?: string
  description?: string
  status: Procedure['status'] | null
}
const TimelineItemRight = ({ date, description, status }: TimelineItemRightTypes) => {
  let color = 'red'
  switch (status) {
    case null: 
      color = '#b7c3d9'
      break
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

    const statusColorMap: Partial<Record<Procedure['status'], string>> = {
  'preparation': '#EDB88B',
  'on-hold': '#EDB88B',
  'in-progress': '#EDB88B',
  'stopped': '#EF3E36',
  'entered-in-error': '#EF3E36',
  'unknown': '#EF3E36',
  'not-done': '#EF3E36',
  'completed': '#17DEBB'
}

  const { classes } = useStyles({ color: status === null ? '#b7c3d9' : (statusColorMap[status] || '#17DEBB') })

    return (
       <Box display={'flex'} alignItems={'center'}>
          <Box flex="0 0 30px" display="flex" alignItems="center">
            <Box flexShrink={0} width={15} className={classes.dotRight}></Box>
            <Box width={10} className={classes.lineRight}/>
          </Box>
          <Box flex="1" display="flex" alignItems="center" gap={1}>
        <Box><Typography className={classes.time}>{date ? new Date(date).toLocaleDateString('fr-Fr') : 'Date inconnue'}</Typography></Box>
        {description && <Box className={classes.timelineTextRight}>{description}</Box>}
      </Box>
    </Box>
  )
  
}

export default TimelineItemRight
