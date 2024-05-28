import React from 'react'

import FemaleIcon from 'assets/icones/venus.svg?react'
import MaleIcon from 'assets/icones/mars.svg?react'
import UnknownIcon from 'assets/icones/autre-inconnu.svg?react'

import { GenderStatus } from 'types/searchCriterias'

type GenderIconProps = {
  gender?: GenderStatus
  className?: string
}

const GenderIcon = ({ gender, className }: GenderIconProps) => {
  switch (gender) {
    case GenderStatus.MALE:
      return <MaleIcon className={className} />

    case GenderStatus.FEMALE:
      return <FemaleIcon className={className} />

    default:
      return <UnknownIcon className={className} />
  }
}

export default GenderIcon
