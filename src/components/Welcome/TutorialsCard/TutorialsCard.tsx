import React from 'react'

import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { TUTORIAL_VIDEOS } from 'views/Onboarding/tutorials'

import useStyles from './styles'

const TutorialsCard = () => {
  const { classes } = useStyles()

  return (
    <>
      <div id="tutorials-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Tutoriels
        </Typography>
      </div>
      <Divider className={classes.divider} />

      <video
        className={classes.video}
        src={TUTORIAL_VIDEOS.export}
        aria-label="Exporter des données"
        controls
        playsInline
        preload="metadata"
      />
    </>
  )
}

export default TutorialsCard
