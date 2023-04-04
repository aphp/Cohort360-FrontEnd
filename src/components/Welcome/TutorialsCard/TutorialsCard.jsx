import React, { useState } from 'react'
import clsx from 'clsx'

import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import useStyles from './styles'

const YoutubeEmbed = ({ embedId }) => (
  <iframe
    width="510"
    height="360"
    src={`https://www.youtube.com/embed/${embedId}`}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    title="Tutorial youtube"
  />
)

const TutorialsCard = () => {
  const classes = useStyles()

  const [currentIndex, setCurrentIndex] = useState(0)

  const youtubeIds = ['01ZgR9lk_aE', 'BdtmlvXjKWs', 'ykyMg_4MVcI', 'ze-NYJmFZsI', '-UjXIK4Svb4']

  const _onChangeCurrentIndex = (index) => {
    if (index >= 0 && index <= youtubeIds.length - 1) {
      setCurrentIndex(index)
    }
  }

  return (
    <>
      <div id="tutorials-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Tutoriels
        </Typography>
      </div>
      <Divider className={classes.divider} />

      <Grid id="tutorials-card-carousel" className={classes.carouselContainer}>
        {/* Content */}
        {youtubeIds.map(
          (m, i) =>
            currentIndex === i && (
              <Paper key={i} className={classes.carouselPaper}>
                <Grid className={classes.videoResponsive}>
                  <YoutubeEmbed embedId={m} />
                </Grid>
              </Paper>
            )
        )}

        {/* Pagination Items (Left/Right Chevron + indicator) */}
        {currentIndex > 0 && (
          <Grid className={clsx(classes.indicator, classes.leftIndicator)}>
            <IconButton size="small" onClick={() => _onChangeCurrentIndex(currentIndex - 1)}>
              <KeyboardArrowLeftIcon fontSize="medium" />
            </IconButton>
          </Grid>
        )}
        {currentIndex < youtubeIds.length - 1 && (
          <Grid className={clsx(classes.indicator, classes.rightIndicator)}>
            <IconButton size="small" onClick={() => _onChangeCurrentIndex(currentIndex + 1)}>
              <KeyboardArrowRightIcon fontSize="medium" />
            </IconButton>
          </Grid>
        )}

        <Grid className={classes.dotIndicatorContainer}>
          {youtubeIds.map((DO_NOT_USE, i) =>
            currentIndex === i ? (
              <RadioButtonCheckedIcon key={i} onClick={() => setCurrentIndex(i)} />
            ) : (
              <RadioButtonUncheckedIcon key={i} onClick={() => setCurrentIndex(i)} />
            )
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default TutorialsCard
