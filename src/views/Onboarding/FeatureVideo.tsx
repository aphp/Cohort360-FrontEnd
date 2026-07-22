import React from 'react'

import useStyles from './styles'

const VIDEOS_PATH = '/assets/videos'

type Props = {
  /** Base name of the mp4 and of its picture, both served from `public/assets/videos`. */
  name: string
  /** Described to assistive technologies, which cannot read the video. */
  label: string
}

const FeatureVideo = ({ name, label }: Props) => {
  const { classes } = useStyles()

  return (
    <video
      className={classes.video}
      controls
      preload="none"
      poster={`${VIDEOS_PATH}/${name}_poster.jpg`}
      aria-label={label}
    >
      <source src={`${VIDEOS_PATH}/${name}.mp4`} type="video/mp4" />
    </video>
  )
}

export default FeatureVideo
