import React from 'react'

import { Card, CardActions, CardContent, Divider, makeStyles, Typography } from '@material-ui/core'
import { Notifications } from '@material-ui/icons'
import { useHistory } from 'react-router'

import Title from 'components/Title'
import Button from 'common/CohortButton'

const useStyles = makeStyles((theme) => ({
  notifIcon: {
    color: '#d6631b'
  },
  messageContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2)
  },
  noRequest: {
    fontStyle: 'italic'
  }
}))

const AccessRequestNotifCard = () => {
  const classes = useStyles()
  const history = useHistory()

  //TODO: Wire with access requests routes
  const requestCount = 0

  const handleAccessRequestsClick = () => {
    history.push('/accessRequests')
  }

  return (
    <Card>
      <CardContent>
        <Title>Demandes d'accès</Title>
        <Divider />
        <div className={classes.messageContainer}>
          {requestCount <= 0 ? (
            <Typography className={classes.noRequest}>Aucune nouvelle demande</Typography>
          ) : (
            <>
              <Notifications className={classes.notifIcon} />
              <Typography>1 nouvelle demande</Typography>
            </>
          )}
        </div>
      </CardContent>
      <CardActions>
        <Button onClick={handleAccessRequestsClick} fullWidth>
          Voir les demandes d'accès
        </Button>
      </CardActions>
    </Card>
  )
}

export default AccessRequestNotifCard
