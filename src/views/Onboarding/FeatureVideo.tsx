import React from 'react'

import useStyles from './styles'

// Domaine sans cookie : rien n'est déposé tant que la vidéo n'est pas lancée.
const EMBED_PATH = 'https://www.youtube-nocookie.com/embed'

type Props = {
  /** Identifiant de la vidéo sur la chaîne Cohort360. */
  videoId: string
  /** Described to assistive technologies, which cannot read the video. */
  label: string
}

const FeatureVideo = ({ videoId, label }: Props) => {
  const { classes } = useStyles()

  return (
    <iframe
      className={classes.video}
      src={`${EMBED_PATH}/${videoId}`}
      title={label}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="encrypted-media; picture-in-picture"
      allowFullScreen
    />
  )
}

export default FeatureVideo
