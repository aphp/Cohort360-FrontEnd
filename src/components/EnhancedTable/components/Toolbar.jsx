import React from 'react'
import PropTypes from 'prop-types'

import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import { makeStyles } from '@material-ui/core/styles'

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  title: {
    flex: '1 1 100%'
  },
  actionMenu: {
    display: 'flex'
  }
}))

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles()
  const { intl, headTitle, numSelected, headAction } = props

  return (
    <Toolbar className={classes.root}>
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1">
          {headTitle} - {numSelected} {intl.formatMessage({ id: 'selected' }).toLowerCase()}
        </Typography>
      ) : (
        <Typography className={classes.title} color="inherit" variant="subtitle1">
          {headTitle}
        </Typography>
      )}
      {headAction && <div className={classes.actionMenu}>{headAction}</div>}
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired
}

export default EnhancedTableToolbar
