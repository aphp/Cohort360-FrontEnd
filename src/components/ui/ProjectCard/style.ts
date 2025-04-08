import { styled } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

export const StyledCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
  width: '100%',
  height: 184,
  padding: 20,
  borderRadius: 12,
  backgroundColor: '#E6F1FD',
  gap: 8,
  position: 'relative',
  '&:hover': {
    boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    cursor: 'pointer'
  }
}))

export const ProjectTitle = styled(Typography)(() => ({
  fontSize: '13px',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 'bold',
  color: '#232e6a',
  textAlign: 'center',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  WebkitLineClamp: 2, // Limiter à 2 lignes
  lineHeight: '1.5em',
  maxHeight: '3em' // Correspond à 2 lignes de hauteur
}))
