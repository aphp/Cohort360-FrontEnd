import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

export default function Title(props) {
  const marginTopPx = props.marginTopPx

  return (
    <Typography style={{ marginTop: marginTopPx }} component="h2" variant="h2" color="primary" gutterBottom>
      {props.children}
    </Typography>
  )
}

Title.propTypes = {
  children: PropTypes.node
}
