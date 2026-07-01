import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'

export type OnboardingStepConfig = {
  key: string
  label: string
  summary: string
  icon: ComponentType<SvgIconProps>
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    key: 'environment',
    label: 'Découvrir votre environnement',
    summary: 'Apprenez-en plus sur ce qu’est Cohort360 et sur vos accès aux données dans l’outil.',
    icon: MenuBookIcon
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
