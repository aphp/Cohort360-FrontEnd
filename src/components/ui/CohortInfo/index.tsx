import React from 'react'

import { Box, Skeleton, Typography } from '@mui/material'

type CohortInfoProps = {
  id?: string
  label: string
  loading: boolean
  total: string
}

const CohortInfo: React.FC<CohortInfoProps> = ({ id, label, total, loading }) => {
  return (
    <>
      {loading ? (
        <Skeleton width={100} />
      ) : (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontFamily={"'Montserrat', sans-serif"} fontSize={13} color={'#222'}>
            {label} :
          </Typography>
          <Typography id={id} fontFamily={"'Montserrat', sans-serif"} fontSize={14} fontWeight={700} color={'#153D8A'}>
            {total}
          </Typography>
        </Box>
      )}
    </>
  )
}

export default CohortInfo
