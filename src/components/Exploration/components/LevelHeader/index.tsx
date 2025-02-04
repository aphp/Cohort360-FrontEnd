import React, { ReactNode } from 'react'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'

type LevelHeaderProps = {
  loading: boolean
  name: string
  hideActions: boolean
  description: string
  actions: ReactNode
}

const LevelHeader = ({ loading, name, hideActions, description, actions }: LevelHeaderProps) => {
  return (
    <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
      <Grid container gap="20px">
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
          <Box width="100%" display={'flex'} justifyContent={'center'} alignItems={'center'} gap={'8px'}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Typography fontWeight={'bold'} fontSize={'24px'} fontFamily={"'Montserrat', sans-serif"}>
                  {name}
                </Typography>
                {hideActions && <Box>{actions}</Box>}
              </>
            )}
          </Box>
          <Typography
            fontWeight={600}
            fontSize={'15px'}
            fontFamily={"'Montserrat', sans-serif"}
            paddingTop={'8px'}
            color="black"
          >
            {description}
          </Typography>
        </Box>
      </Grid>
    </Box>
  )
}

export default LevelHeader
