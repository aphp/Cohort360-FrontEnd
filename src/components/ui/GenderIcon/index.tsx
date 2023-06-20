import React from 'react'

import { ReactComponent as FemaleIcon } from 'assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from 'assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from 'assets/icones/autre-inconnu.svg'

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
