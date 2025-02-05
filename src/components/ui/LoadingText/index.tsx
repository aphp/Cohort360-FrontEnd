import React from 'react'
import Box from '@mui/material/Box'

type LoadingTextProps = {
    width?: string
}

const LoadingText = ({width = "100%"}: LoadingTextProps) => {
  return (
    <Box
      sx={{
        width,
        height: '100%',
        backgroundColor: 'grey.300', // Une nuance de gris de Material-UI
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        borderRadius: '4px', // Facultatif : ajoute des coins arrondis
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 }
        }
      }}
    />
  )
}

export default LoadingText
