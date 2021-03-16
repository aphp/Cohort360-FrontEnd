import React from 'react'

import { Grid, makeStyles, Typography } from '@material-ui/core'
import moment from 'moment'
import { useAppSelector } from 'state'

const useStyles = makeStyles((theme) => ({
  textBlack: {
    color: '#000'
  },
  perimetersList: {
    paddingLeft: theme.spacing(2),
    textIndent: theme.spacing(-2),
    listStyle: 'none'
  }
}))

type RequestInfosProps = {
  id: string
}

const RequestInfos = ({ id }: RequestInfosProps) => {
  const classes = useStyles()
  const { request } = useAppSelector((state) => ({
    request: state.accessRequests.requests.find(({ id: requestId }) => requestId === id)
  }))
  const dateSubtitle = moment(request?.date).format('[Le] DD MMMM YYYY [à] HH[h]mm')

  return request ? (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h2" className={classes.textBlack}>
          {request.author}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {dateSubtitle}
        </Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.textBlack} variant="subtitle1">
          Accès aux nouveaux périmètres suivants :
        </Typography>
        <ul className={classes.perimetersList}>
          {request.perimeterAccess.map((name, index) => (
            <li key={`${name}_${index}_request`}>
              <Typography variant="h5">- {name}</Typography>
            </li>
          ))}
        </ul>
      </Grid>
      <Grid item>
        <Typography variant="h3" className={classes.textBlack} gutterBottom>
          Commentaires
        </Typography>
        <Typography align="justify">{request.comment}</Typography>
      </Grid>
    </Grid>
  ) : null
}

export default RequestInfos
