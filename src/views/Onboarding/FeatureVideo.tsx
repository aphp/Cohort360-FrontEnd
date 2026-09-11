import React from 'react'

import useStyles from './styles'

const TUTORIAL_URL = 'https://formaphp.fr/documents/orbisetmoi/Tutoriels_Video/Cohort360_v0.mp4'

type Props = {
  /** Position de départ du chapitre dans le tutoriel, en secondes. */
  startAt: number
  /** Described to assistive technologies, which cannot read the video. */
  label: string
}

const FeatureVideo = ({ startAt, label }: Props) => {
  const { classes } = useStyles()

  return (
    <video
      className={classes.video}
      src={`${TUTORIAL_URL}#t=${startAt}`}
      aria-label={label}
      controls
      playsInline
      preload="metadata"
    />
  )
}

export default FeatureVideo
