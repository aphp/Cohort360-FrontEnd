import React from 'react'
import Card from '@mui/material/Card'
import { Box, Button, Chip } from '@mui/material'

import useStyles from './styles'
import { CohortComposition, CohortEncounter } from 'types'

type HospitItemTypes = {
  data: CohortEncounter
  isPeriod: boolean
  onClick: (documents: CohortComposition[]) => void
}

const classColorMap: Record<string, string> = {
  hosp: '#C3DCA5',
  urg: '#FC568F',
  ext: '#FFE755',
  incomp: '#A7E5FF'
}

const HospitItem = ({ data, onClick, isPeriod }: HospitItemTypes) => {
  const { classes } = useStyles({
    dotHeight: isPeriod ? 45 : 16,
    color: data?.class?.code ? (classColorMap[data.class.code] ?? '#A7E5FF') : '#A7E5FF'
  })
  const periodStart = data.period?.start
    ? new Date(data.period.start).toLocaleDateString('fr-FR', { timeZone: 'UTC' })
    : ''
  const periodEnd = data.period?.end ? new Date(data.period.end).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : ''
  return (
    <Box display={'flex'} alignItems={'center'}>
      <Box flex="1">
        <Card className={classes.hospitCard} variant="outlined">
          <Box padding="8px 16px" display={'flex'} flexDirection={'column'} gap={1}>
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'}>
              {data.serviceProvider?.display && (
                <Chip label={data.serviceProvider.display} size="small" className={classes.chip} />
              )}
              {data.documents && data.documents.length > 0 && (
                <Button
                  variant="text"
                  sx={{ color: '#999', textDecoration: 'underline', fontSize: 12 }}
                  onClick={() => onClick(data.documents ?? [])}
                >
                  + de détails
                </Button>
              )}
            </Box>
            <Box display={'flex'} flexDirection={'column'} gap={0.5}>
              <div className={classes.hospitTitle}>{data.class ? data.class.display : 'classe inconnue'}</div>
              {periodStart === periodEnd ? (
                <div className={classes.hospitDates}>{periodStart ? `Le ${periodStart}` : 'Pas de date'}</div>
              ) : (
                <div className={classes.hospitDates}>
                  {periodStart && periodEnd ? `Du ${periodStart} au ${periodEnd}` : `Depuis le ${periodStart}`}
                </div>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
      <Box flex="0 0 30px" display="flex" alignItems={'center'}>
        <Box className={classes.line} flex={1} />
        <Box flexShrink={0} width={15} className={classes.hospitDot}></Box>
      </Box>
    </Box>
  )
}

export default HospitItem
