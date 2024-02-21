import React from 'react'
import { Box, Typography } from '@mui/material'

interface ArrowWithYearsProps {
  years: string[]
}

const ArrowWithYears: React.FC<ArrowWithYearsProps> = ({ years }) => {
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
          borderBottom: '10px solid #000'
        }}
      />

      <Box
        sx={{
          width: '2px',
          backgroundColor: '#000',
          flexGrow: 1
        }}
      />

      {/* {years.map((year, index) => (
        <Typography
          key={year}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: `${(index / years.length) * 100}%`,
            fontSize: '0.75rem'
          }}
        >
          {year}
        </Typography>
      ))} */}
    </Box>
  )
}

export default ArrowWithYears
