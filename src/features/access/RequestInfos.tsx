import React from 'react'

import { Grid, makeStyles, Typography } from '@material-ui/core'
import moment from 'moment'

const mock = {
  author: 'Dr Marine Dijoux',
  date: '03/09/2021 17:08',
  perimeterAccess: ['Neurologie'],
  comment:
    'Ardeo, mihi credite, Patres conscripti (id quod vosmet de me existimatis et facitis ipsi) incredibili quodam amore patriae, qui me amor et subvenire olim impendentibus periculis maximis cum dimicatione capitis, et rursum, cum omnia tela undique esse intenta in patriam viderem, subire coegit atque excipere unum pro universis. Hic me meus in rem publicam animus pristinus ac perennis cum C. Caesare reducit, reconciliat, restituit in gratiam.'
}

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

const RequestInfos = () => {
  const classes = useStyles()
  const dateSubtitle = moment(mock.date).format('[Le] DD MMMM YYYY [à] HH[h]mm')

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h2" className={classes.textBlack}>
          {mock.author}
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
          {mock.perimeterAccess.map((name, index) => (
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
        <Typography align="justify">{mock.comment}</Typography>
      </Grid>
    </Grid>
  )
}

export default RequestInfos
