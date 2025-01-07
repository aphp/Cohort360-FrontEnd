import React from 'react'

import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'

// TODO: sommes-nous au bon endroit pour faire ça?
// TODO: si oui, à externaliser sur les endroits où c'est utilisé

type FavStarProps = {
  favorite?: boolean
}

const FavStar: React.FC<FavStarProps> = ({ favorite }) => {
  if (favorite) {
    return <StarFull height="15px" fill="#ED6D91" />
  }
  return <Star height="15px" fill="#ED6D91" />
}

export default FavStar
