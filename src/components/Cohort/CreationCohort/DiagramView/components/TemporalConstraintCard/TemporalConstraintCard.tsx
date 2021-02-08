import React from 'react'
import { Card, CardHeader, CardContent, IconButton, Typography, Button } from '@material-ui/core'

import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()

  return (
    <>
      <Card className={classes.card}>
        <CardHeader className={classes.cardHeader} title="Choisir une contrainte temporelle" />
        <CardContent />
      </Card>
    </>
  )
}

export default TemporalConstraintView
