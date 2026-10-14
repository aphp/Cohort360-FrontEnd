import React from 'react'

import useStyles from './styles'

type Props = {
  src: string
  label: string
}

const FeatureVideo = ({ src, label }: Props) => {
  const { classes } = useStyles()

  return <video className={classes.video} src={src} aria-label={label} controls playsInline preload="metadata" />
}

export default FeatureVideo
