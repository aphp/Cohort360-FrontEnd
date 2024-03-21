import React from 'react'
import { Box } from '@mui/material'

const TimelineArrow: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '20px'
      }}
    >
      <Box
        sx={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '16px solid #153d8a'
        }}
      />

      <Box
        sx={{
          width: '4px',
          backgroundColor: '#153d8a',
          flexGrow: 1
        }}
      />
    </Box>
  )
}

export default TimelineArrow
