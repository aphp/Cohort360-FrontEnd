import React from 'react'

import { Box, Grid, Typography } from '@mui/material'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'
import GenderIcon from 'components/ui/GenderIcon'

type PatientInfoTypes = {
  gender?: GenderStatus
  age: string
  ipp?: string
  deidentified: boolean
}
const PatientInfo: React.FC<PatientInfoTypes> = ({ gender, age, ipp, deidentified }) => {
  const { classes } = useStyles()

  return (
    <Box display="flex" alignItems="center">
      <Grid container item justifyContent="center" alignItems="center" className={classes.whiteCircle}>
        <GenderIcon gender={gender?.toLocaleUpperCase() as GenderStatus} size={44} color="#153D8A" />
      </Grid>
      <Box display="flex" flexDirection="column" ml={1}>
        <Typography fontFamily={"'Montserrat', sans-serif"} fontSize={14} fontWeight={500} color={'#2b2b2b'}>
          {age}
        </Typography>
        <Box display={'flex'} alignItems={'center'} gap={'4px'}>
          <Typography fontFamily={"'Montserrat', sans-serif"} fontSize={13} color={'#2b2b2b'}>
            {deidentified ? 'IPP chiffré :' : 'IPP :'}
          </Typography>
          <Typography fontFamily={"'Montserrat', sans-serif"} fontSize={14} fontWeight={500} color={'#2b2b2b'}>
            {ipp}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default PatientInfo
