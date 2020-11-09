import React from 'react'
import useStyles from './styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const TopBarItem = (props) => {
  const classes = useStyles(props.header)

  return (
    <Grid item>
      <Typography className={classes.text} variant={props.header ? 'h6' : 'subtitle2'}>
        {props.text}
      </Typography>
    </Grid>
  )
}

TopBarItem.propTypes = {
  header: PropTypes.bool.isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

TopBarItem.defaultProps = {
  header: false,
  text: '-'
}

export default TopBarItem
