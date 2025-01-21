import React from 'react'

import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'

// TODO: sommes-nous au bon endroit pour faire ça?
// TODO: si oui, à externaliser sur les endroits où c'est utilisé

type FavStarProps = {
  favorite?: boolean
  height?: number
  color?: string
}

const FavStar: React.FC<FavStarProps> = ({ favorite, height = 15, color = '#ED6D91' }) => {
  if (favorite) {
    return <StarFull height={height} fill={color} />
  }
  return <Star height={height} fill={color} />
}

export default FavStar
