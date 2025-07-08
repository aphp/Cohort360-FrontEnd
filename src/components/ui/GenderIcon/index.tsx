import React from 'react'
import UnknownIcon from 'assets/icones/autre-inconnu.svg?react'
import { Female, Male } from '@mui/icons-material'
import { GenderStatus } from 'types/searchCriterias'

type GenderIconProps = {
  gender?: GenderStatus
  color?: string
  size?: number
}

const GenderIcon = ({ gender, color = 'inherit', size = 24 }: GenderIconProps) => {
  switch (gender) {
    case GenderStatus.MALE:
      return <Male htmlColor={color} sx={{ fontSize: size }} />

    case GenderStatus.FEMALE:
      return <Female htmlColor={color} sx={{ fontSize: size }} />

    default:
      return <UnknownIcon style={{ fill: color, height: size, width: size }} />
  }
}

export default GenderIcon
