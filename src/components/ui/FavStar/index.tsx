import React from 'react'

import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'

type FavStarProps = {
  favorite?: boolean
  height?: number
  color?: string
}

const FavStar: React.FC<FavStarProps> = ({ favorite, height = 15, color = '#ED6D91' }) => {
  return favorite ? (
    <StarFull className="full-star" height={height} fill={color} />
  ) : (
    <Star className="empty-star" height={height} fill={color} />
  )
}

export default FavStar
