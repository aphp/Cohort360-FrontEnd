import React, { useState } from 'react'
import clsx from 'clsx'

import Divider from '@material-ui/core/Divider'
// import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'

import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'

import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'

import Title from '../../Title'

import useStyles from './styles'

const YoutubeEmbed = ({ embedId }) => (
  <Grid className="video-responsive">
    <iframe
      width="510"
      height="360"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </Grid>
)

const TutorialsCard = () => {
  const classes = useStyles()

  const [currentIndex, setCurrentIndex] = useState(0)

  const youtubeIds = ['uMeBJdWPnQM', 'BdtmlvXjKWs', 'ykyMg_4MVcI', 'ze-NYJmFZsI', '-UjXIK4Svb4']

  const _onChangeCurrentIndex = (index) => {
    if (index >= 0 && index <= youtubeIds.length - 1) {
      setCurrentIndex(index)
    }
  }

  return (
    <>
      <Title>Tutoriels</Title>
      <Divider className={classes.divider} />
      {/* <Typography color="textSecondary">Nouvelle fonctionnalité à venir !</Typography> */}

      <Grid className={classes.carouselContainer}>
        {/* Content */}
        {youtubeIds.map(
          (m, i) =>
            currentIndex === i && (
              <Paper key={i} className={classes.carouselPaper}>
                <YoutubeEmbed embedId={m} />
              </Paper>
            )
        )}

        {/* Pagination Items (Left/Right Chevron + indicator) */}
        {currentIndex > 0 && (
          <Grid className={clsx(classes.indicator, classes.leftIndicator)}>
            <IconButton onClick={() => _onChangeCurrentIndex(currentIndex - 1)}>
              <KeyboardArrowLeftIcon />
            </IconButton>
          </Grid>
        )}
        {currentIndex < youtubeIds.length - 1 && (
          <Grid className={clsx(classes.indicator, classes.rightIndicator)}>
            <IconButton onClick={() => _onChangeCurrentIndex(currentIndex + 1)}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Grid>
        )}

        <Grid className={classes.dotIndicatorContainer}>
          {youtubeIds.map((DO_NOT_USE, i) =>
            currentIndex === i ? (
              <RadioButtonCheckedIcon onClick={() => setCurrentIndex(i)} />
            ) : (
              <RadioButtonUncheckedIcon onClick={() => setCurrentIndex(i)} />
            )
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default TutorialsCard
