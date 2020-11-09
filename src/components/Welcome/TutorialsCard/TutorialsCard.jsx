import React, { useState } from 'react'
import Carousel from 'react-bootstrap/Carousel'
import Divider from '@material-ui/core/Divider'
import VideoPlayer from 'react-player'

import Title from '../../Title'

import useStyles from './styles'

const TutorialsCard = () => {
  const classes = useStyles()
  const [carouselInterval, setCarouselInterval] = useState(5000)
  const handlePlay = () => {
    setCarouselInterval(null)
  }

  const medias = [
    {
      url: './assets/videos/demo_cohort_360.mp4',
      poster: './assets/videos/demo_cohort_360_poster.jpg'
    },
    {
      url: './assets/videos/constitution_cohorte.mp4',
      poster: './assets/videos/constitution_cohorte_poster.jpg'
    },
    {
      url: './assets/videos/parcours_patient.mp4',
      poster: './assets/videos/parcours_patient_poster.jpg'
    },
    {
      url: './assets/videos/export_dataset.mp4',
      poster: './assets/videos/export_dataset_poster.jpg'
    }
  ]

  return (
    <>
      <Title>Tutoriels</Title>
      <Divider className={classes.divider} />
      <Carousel interval={carouselInterval}>
        {medias.map((m, i) => (
          <Carousel.Item key={i}>
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
              onPlay={handlePlay}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  )
}

export default TutorialsCard
