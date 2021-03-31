import React from 'react'
import useStyles from './styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TopBarItem from './TopBarHeader/TopBarItem'
import IconButton from '@material-ui/core/IconButton'

// import { ReactComponent as SaveIcon } from '../../assets/icones/save.svg'
// import { ReactComponent as Star } from '../../assets/icones/star.svg'

import displayDigit from 'utils/displayDigit'
import { GetApp } from '@material-ui/icons'

type TopBarProps = {
  title?: string
  status?: string
  patientsNb?: number
  access?: string
  openRedcapDialog?: () => void
  save?: boolean
  fav?: boolean
  loading?: boolean
}

const TopBar: React.FC<TopBarProps> = ({ loading, openRedcapDialog, save, ...props }) => {
  const classes = useStyles()

  return (
    <Paper className={classes.root} square>
      <Grid container item xs={11}>
        <Grid container item xs={10} justify="space-between">
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Titre" />
            <TopBarItem text={loading ? '-' : props.title} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Statut" />
            <TopBarItem text={loading ? '-' : props.status} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Nombre de patients" />
            <TopBarItem text={loading ? '-' : displayDigit(props.patientsNb ?? 0)} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Accès" />
            <TopBarItem text={loading ? '-' : props.access} />
          </Grid>
        </Grid>
        <Grid container item xs={2} justify="space-between">
          <IconButton onClick={openRedcapDialog} disabled={!openRedcapDialog}>
            <GetApp height="25px" fill="#5BC5F2" />
          </IconButton>
          {/* <IconButton disabled={!save}>
            <SaveIcon height="25px" fill="#5BC5F2" />
          </IconButton> */}
          {/* {props.fav && (
            <IconButton>
              <Star height="15px" fill="#ED6D91" />
            </IconButton>
          )} */}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TopBar
