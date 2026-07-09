import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'

import DataAccess from './screens/DataAccess'
import UserRights from './screens/UserRights'
import WhatIsCohort360 from './screens/WhatIsCohort360'
import WhatIsEds from './screens/WhatIsEds'

export type OnboardingStepConfig = {
  key: string
  label: string
  summary: string
  icon: ComponentType<SvgIconProps>
  screens?: ComponentType[]
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    key: 'environment',
    label: 'Découvrir votre environnement',
    summary: 'Apprenez-en plus sur ce qu’est Cohort360 et sur vos accès aux données dans l’outil.',
    icon: MenuBookIcon,
    screens: [WhatIsCohort360, WhatIsEds, DataAccess, UserRights]
  },
  {
    key: 'commitments',
    label: 'Comprendre vos engagements',
    summary: 'Prenez connaissance du cadre règlementaire d’utilisation des données et de vos responsabilités.',
    icon: HistoryEduIcon
  },
  {
    key: 'handson',
    label: "Prendre en main l'outil",
    summary: 'Explorez l’outil au travers d’une prise en main guidée de 3 fonctionnalités clés.',
    icon: FormatListBulletedIcon
  }
]

export const getStepScreenCount = (stepIndex: number): number => ONBOARDING_STEPS[stepIndex]?.screens?.length ?? 1
