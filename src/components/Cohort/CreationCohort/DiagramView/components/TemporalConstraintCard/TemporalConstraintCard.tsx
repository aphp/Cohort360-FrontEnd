import React from 'react'
import { Card, CardHeader, CardContent, IconButton, Typography, Button } from '@material-ui/core'

import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()

  return (
    <>
      <Card className={classes.card}>
        <CardHeader className={classes.cardHeader} title="Choisir une contrainte temporelle" />
        <CardContent>
          <>
            <Typography align="center">Ajouter une contrainte temporelle</Typography>
            <div className={classes.actionButtonContainer}>
              <Button variant="contained" color="primary" className={classes.actionButton}>
                <Typography variant="h5">Contrainte temporelle</Typography>
              </Button>
            </div>
          </>
        </CardContent>
      </Card>
    </>
  )
}

export default TemporalConstraintView
