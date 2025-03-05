import React, { ReactNode } from 'react'

import { Box, Grid, Skeleton, Typography } from '@mui/material'

type LevelHeaderProps = {
  loading: boolean
  name: string
  description: string
  actions: ReactNode
}

const LevelHeader = ({ loading, name, description, actions }: LevelHeaderProps) => {
  return (
    <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
      <Grid container gap="20px">
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'} alignItems={'center'}>
          <Box width="100%" display={'flex'} justifyContent={'center'} alignItems={'center'} gap={'8px'}>
            {loading ? (
              <Box
                display="flex"
                width={'100%'}
                justifyContent={'center'}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <Skeleton variant="text" sx={{ fontSize: '2rem' }} width={'25%'} />
                <Skeleton variant="text" sx={{ fontSize: '2rem' }} width={'80%'} />
              </Box>
            ) : (
              <>
                <Typography fontWeight={'bold'} fontSize={'20px'} fontFamily={"'Montserrat', sans-serif"}>
                  {name}
                </Typography>
                <Box>{actions}</Box>
              </>
            )}
          </Box>
          <Typography
            fontStyle={'italic'}
            fontSize={'15px'}
            fontFamily={"'Montserrat', sans-serif"}
            paddingTop={'8px'}
            color="#7b7b7b"
          >
            {description}
          </Typography>
        </Box>
      </Grid>
    </Box>
  )
}

export default LevelHeader
