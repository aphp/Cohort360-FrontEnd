import React from 'react'

import { Card, CardActions, CardContent, Divider, Typography, makeStyles } from '@material-ui/core'

import Button from 'common/CohortButton'
import Title from 'components/Title'

const useStyles = makeStyles((theme) => ({
  list: {
    marginTop: theme.spacing(1)
  }
}))

const PerimeterCard = () => {
  const classes = useStyles()
  return (
    <Card>
      <CardContent>
        <Title>Votre périmètre</Title>
        <Divider />
        <ul className={classes.list}>
          <li>
            <Typography variant="subtitle2">Cardiologie</Typography>
          </li>
        </ul>
      </CardContent>
      <CardActions>
        <Button fullWidth>Explorer votre périmètre</Button>
      </CardActions>
    </Card>
  )
}

export default PerimeterCard
