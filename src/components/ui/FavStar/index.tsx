import React from 'react'

import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'

type FavStarProps = {
  favorite?: boolean
  height?: number
  color?: string
}

const FavStar: React.FC<FavStarProps> = ({ favorite, height = 15, color = '#ED6D91' }) => {
  return favorite ? <StarFull height={height} fill={color} /> : <Star height={height} fill={color} />
}

export default FavStar
