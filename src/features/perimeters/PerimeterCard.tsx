import React from 'react'

import { Card, CardActions, CardContent, Divider, Typography, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router'

import Button from 'common/CohortButton'
import Title from 'components/Title'
import { useAppSelector } from 'state'

const useStyles = makeStyles((theme) => ({
  list: {
    marginTop: theme.spacing(1)
  }
}))

const PerimeterCard = () => {
  const classes = useStyles()
  const history = useHistory()
  const organizations = useAppSelector((state) => state.me?.organizations)
  const disableExplore = !organizations || organizations.length === 0

  const handleExplorePerimeter = () => {
    organizations && history.push(`/perimetres?${organizations.map(({ id }) => id)}`)
  }

  return (
    <Card>
      <CardContent>
        <Title>Votre périmètre</Title>
        <Divider />
        <ul className={classes.list}>
          {organizations
            ? organizations.map(({ name, id }) => (
                <li key={id}>
                  <Typography variant="subtitle2">{name}</Typography>
                </li>
              ))
            : null}
        </ul>
      </CardContent>
      <CardActions>
        <Button disabled={disableExplore} onClick={handleExplorePerimeter} fullWidth>
          Explorer votre périmètre
        </Button>
      </CardActions>
    </Card>
  )
}

export default PerimeterCard
