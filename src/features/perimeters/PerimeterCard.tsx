import React, { useState, useEffect } from 'react'

import {
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  makeStyles,
  CircularProgress,
  Box
} from '@material-ui/core'
import { useHistory } from 'react-router'

import Button from 'common/CohortButton'
import Title from 'components/Title'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPractitionerPerimeter } from 'state/me'

const useStyles = makeStyles((theme) => ({
  list: {
    marginTop: theme.spacing(1)
  }
}))

const PerimeterCard = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const organizations = useAppSelector((state) => state.me?.organizations)
  const [loading, setLoading] = useState(!organizations)
  const disableExplore = !organizations || organizations.length === 0
  const isPerimeterEmpty = organizations && organizations.length > 0

  useEffect(() => {
    setLoading(true)
    dispatch(fetchPractitionerPerimeter()).then(() => {
      setLoading(false)
    })
  }, [dispatch])

  const handleExplorePerimeter = () => {
    organizations && history.push(`/perimetres?${organizations.map(({ id }) => id)}`)
  }

  return (
    <Card>
      <CardContent>
        <Title>Votre périmètre</Title>
        <Divider />
        {loading ? (
          <Box textAlign="center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <ul className={classes.list}>
            {isPerimeterEmpty ? (
              organizations?.map(({ name, id }) => (
                <li key={id}>
                  <Typography variant="subtitle2">{name}</Typography>
                </li>
              ))
            ) : (
              <Typography variant="subtitle2">Périmètre vide</Typography>
            )}
          </ul>
        )}
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
