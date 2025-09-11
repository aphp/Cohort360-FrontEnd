import React from 'react'
import Card from '@mui/material/Card'
import { Box, Button, Chip } from '@mui/material'

import useStyles from './styles'
import { CohortEncounter } from 'types'
import { Encounter } from 'fhir/r4'

type HospitTypes = {
  data: CohortEncounter
  isPeriod: boolean
  open: (encounter?: Encounter) => void
}
const Hospit = ({ data, open, isPeriod }: HospitTypes) => {
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

  const { classes } = useStyles({ dotHeight: isPeriod ? 45 : 16, color: color })
  const periodStart = data.period?.start ? new Date(data.period.start).toLocaleDateString('fr-FR') : '-'
  const periodEnd = data.period?.end ? new Date(data.period.end).toLocaleDateString('fr-FR') : '-'
  return (
    <Box display={'flex'} alignItems={'center'}>
      <Box flex="1">
        <Card className={classes.leftHospitCard} variant="outlined">
          <Box padding="15px" display={'flex'} flexDirection={'column'} gap={1}>
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'}>
              {data.serviceProvider?.display && (
                <Chip label={data.serviceProvider.display} size="small" className={classes.chip} />
              )}
              {data.documents && data.documents.length > 0 && (
                <Button
                  variant="text"
                  sx={{ color: '#999', textDecoration: 'underline', fontSize: 12 }}
                  onClick={() => open(data)}
                >
                  + de détails
                </Button>
              )}
            </Box>
            <Box display={'flex'} flexDirection={'column'} gap={0.5}>
              <div className={classes.hospitTitle}>{data.class ? data.class.display : 'classe inconnue'}</div>
              {data?.class?.code === 'ext' ? (
                <div className={classes.hospitDates}>
                  {data.period?.start ? `Le ${new Date(data.period.start).toLocaleDateString('fr-FR')}` : 'Pas de date'}
                </div>
              ) : (
                <div className={classes.hospitDates}>{`Du ${periodStart} au ${periodEnd}`}</div>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
      <Box flex="0 0 30px" display="flex" alignItems={'center'}>
        <Box className={classes.lineLeft} flex={1} />
        <Box flexShrink={0} width={15} className={classes.dotLeft}></Box>
      </Box>
    </Box>
  )
}

export default Hospit
