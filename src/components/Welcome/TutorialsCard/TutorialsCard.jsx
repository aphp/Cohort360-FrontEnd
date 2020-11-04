import React from 'react'
import useStyles from './style'
import Typography from '@material-ui/core/Typography'
import Title from '../../Title'
import Divider from '@material-ui/core/Divider'

export default function TutorialsCard() {
  const classes = useStyles()
  return (
    <React.Fragment>
      <Title>Tutoriels</Title>
      <Divider className={classes.divider} />
      <Typography color="textSecondary">
        Nouvelle fonctionnalité à venir !
      </Typography>
    </React.Fragment>
  )
}
