import React from 'react'
import { BadgeWrapper } from './style'

type BadgeProps = {
  total: number
}

const Badge: React.FC<BadgeProps> = ({ total }) => {
  return <BadgeWrapper className="badge">{total}</BadgeWrapper>
}

export default Badge
