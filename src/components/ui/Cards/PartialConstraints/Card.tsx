import React from 'react'
import { Card as CardMui, CardContent, CardHeader, CardActions } from '@mui/material'
import useStyles from './styles'

type CardProps = {
  title: string
  children: React.ReactNode
  actions: React.ReactNode
  wrap?: boolean
  width?: number
}

const Card: React.FC<CardProps> = ({ title, children, actions, wrap, width }) => {
  const { classes } = useStyles()

  return (
    <CardMui className={classes.card} style={{ ...(width && { width: width }) }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h3',
          align: 'center',
          color: '#0063AF',
          padding: '0 20px',
          textTransform: 'uppercase',
          fontSize: 11,
          fontWeight: 'bold'
        }}
        className={classes.cardHeader}
      />
      <CardContent
        style={{
          display: 'flex',
          overflow: wrap ? 'scroll' : 'auto',
          width: wrap ? '100%' : 'inherit',
          ...(wrap && { flexWrap: 'wrap' }),
          ...(!wrap && { padding: '0 16px', height: '80%', flexDirection: 'column', alignItems: 'center' })
        }}
      >
        {children}
      </CardContent>
      <CardActions sx={{ padding: 0, alignSelf: 'flex-end' }}>{actions}</CardActions>
    </CardMui>
  )
}

export default Card
