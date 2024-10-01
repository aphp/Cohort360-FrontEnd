import React from 'react'
import UnknownIcon from 'assets/icones/autre-inconnu.svg?react'
import { Female, Male } from '@mui/icons-material'
import { GenderStatus } from 'types/searchCriterias'

type GenderIconProps = {
  gender?: GenderStatus
  className?: string
}

const GenderIcon = ({ gender, className }: GenderIconProps) => {
  switch (gender) {
    case GenderStatus.MALE:
      return <Male className={className} />

    case GenderStatus.FEMALE:
      return <Female className={className} />

    default:
      return <UnknownIcon className={className} />
  }
}

export default GenderIcon
