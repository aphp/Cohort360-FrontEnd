import React from 'react'
import useStyles from './styles'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Title from '../../Title'

export default function TutorialsCard() {
  const classes = useStyles()
  return (
    <>
      <Title>Actualités</Title>
      <Divider className={classes.divider} />
      <Typography color="textSecondary">Nouvelle fonctionnalité à venir !</Typography>
    </>
  )
}
