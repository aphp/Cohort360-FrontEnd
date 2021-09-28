import React, { useState } from 'react'
import clsx from 'clsx'

import VideoPlayer from 'react-player'

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

const TutorialsCard = () => {
  const classes = useStyles()

  const [currentIndex, setCurrentIndex] = useState(0)

  const medias = [
    {
      url: '/api/dispose/Cohort360_video_Creation_cohorte_v1.3.mp4',
      poster: '/api/dispose/Screenshot-2021-08-26-at-10.57.28.png'
    },
    {
      url: '/api/dispose/Cohort360_video_Detail_patient_v1.3.mp4',
      poster: '/api/dispose/Screenshot-2021-08-26-at-10.56.33.png'
    },
    {
      url: '/api/dispose/Recherche_video_textuelle_video_v1.2.mp4',
      poster: '/api/dispose/Screenshot-2021-08-26-at-10.55.10.png'
    }
  ]

  const _onChangeCurrentIndex = (index) => {
    if (index >= 0 && index <= medias.length - 1) {
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
        {medias.map(
          (m, i) =>
            currentIndex === i && (
              <Paper key={i} className={classes.carouselPaper}>
                <Grid>
                  <VideoPlayer
                    url={m.url}
                    width="100%"
                    controls
                    config={{
                      file: {
                        attributes: {
                          poster: m.poster,
                          preload: 'metadata'
                        }
                      }
                    }}
                  />
                </Grid>
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
        {currentIndex < medias.length - 1 && (
          <Grid className={clsx(classes.indicator, classes.rightIndicator)}>
            <IconButton onClick={() => _onChangeCurrentIndex(currentIndex + 1)}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Grid>
        )}

        <Grid className={classes.dotIndicatorContainer}>
          {medias.map((DO_NOT_USE, i) =>
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
