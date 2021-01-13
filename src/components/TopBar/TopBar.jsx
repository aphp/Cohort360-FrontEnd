import React from 'react'
import useStyles from './styles'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TopBarItem from './TopBarHeader/TopBarItem'
import IconButton from '@material-ui/core/IconButton'

import { ReactComponent as SaveIcon } from '../../assets/icones/save.svg'
// import { ReactComponent as Star } from '../../assets/icones/star.svg'

import displayDigit from 'utils/displayDigit'

const TopBar = (props) => {
  const classes = useStyles()

  return (
    <Paper className={classes.root} square>
      <Grid container item xs={11}>
        <Grid container item xs={10} justify="space-between">
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Titre" />
            <TopBarItem text={props.title} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Statut" />
            <TopBarItem text={props.status} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Nombre de patients" />
            <TopBarItem text={displayDigit(props.patientsNb)} />
          </Grid>
          <Grid item xs={3} direction="column" container>
            <TopBarItem header text="Accès" />
            <TopBarItem text={props.access} />
          </Grid>
        </Grid>
        <Grid container item xs={2} justify="space-between">
          {props.save && (
            <IconButton>
              <SaveIcon height="25px" fill="#5BC5F2" />
            </IconButton>
          )}
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

TopBar.propTypes = {
  title: PropTypes.string,
  status: PropTypes.string,
  patientsNb: PropTypes.number,
  access: PropTypes.string,
  openRedcapDialog: PropTypes.func,
  save: PropTypes.bool,
  fav: PropTypes.bool
}

export default TopBar
