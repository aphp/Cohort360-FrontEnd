import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'

import ActionsLogging from './screens/commitments/ActionsLogging'
import CareTeamSharing from './screens/commitments/CareTeamSharing'
import CommitmentsSummary from './screens/commitments/CommitmentsSummary'
import DataCrossing from './screens/commitments/DataCrossing'
import DataDeletion from './screens/commitments/DataDeletion'
import MinimalDataUse from './screens/commitments/MinimalDataUse'
import UsagePurposes from './screens/commitments/UsagePurposes'
import UsageRules from './screens/commitments/UsageRules'
import DataAccess from './screens/environment/DataAccess'
import UserRights from './screens/environment/UserRights'
import WhatIsCohort360 from './screens/environment/WhatIsCohort360'
import WhatIsEds from './screens/environment/WhatIsEds'
import KeyFeatures from './screens/handson/KeyFeatures'

// Mirrors User.ONBOARDING_TOTAL_STEPS server-side.
export const ONBOARDING_TOTAL_STEPS = 3

/** Actions a screen's primary button can trigger, injected by the wizard. */
export type OnboardingActions = {
  signCharter: () => Promise<unknown>
}

/**
 * Replaces the default `Continuer` button on a screen. `run`, when set, runs before the journey
 * moves on: a rejection leaves the user where they are, with the error surfaced by the wizard.
 */
export type OnboardingPrimaryAction = {
  label: string
  run?: (actions: OnboardingActions) => Promise<unknown>
  /** Shown instead of the generic progress-saving error when `run` rejects. */
  errorMessage?: string
}

export type OnboardingScreenConfig = {
  key: string
  component: ComponentType
  /** Étiquette affichée au-dessus du titre, par exemple « Engagement 3 » (RG3429.02). */
  tag?: string
  /** `bare` drops the white card, for screens bringing their own container. */
  layout?: 'card' | 'bare'
  primaryAction?: OnboardingPrimaryAction
  /** Holds the primary button until the screen reports an explicit acknowledgement. */
  requiresAcknowledgement?: boolean
}

export type OnboardingStepConfig = {
  key: string
  label: string
  summary: string
  icon: ComponentType<SvgIconProps>
  screens: OnboardingScreenConfig[]
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    key: 'environment',
    label: 'Découvrir votre environnement',
    summary: 'Apprenez-en plus sur ce qu’est Cohort360 et sur vos habilitations aux données dans l’outil.',
    icon: MenuBookIcon,
    screens: [
      { key: 'what-is-cohort360', component: WhatIsCohort360 },
      { key: 'what-is-eds', component: WhatIsEds },
      { key: 'data-access', component: DataAccess },
      { key: 'user-rights', component: UserRights }
    ]
  },
  {
    key: 'commitments',
    label: 'Comprendre vos engagements',
    summary: 'Prenez connaissance du cadre règlementaire d’utilisation des données et de vos responsabilités.',
    icon: HistoryEduIcon,
    screens: [
      { key: 'usage-rules', component: UsageRules },
      { key: 'usage-purposes', component: UsagePurposes },
      { key: 'minimal-data-use', component: MinimalDataUse },
      { key: 'data-crossing', component: DataCrossing },
      { key: 'data-deletion', component: DataDeletion },
      { key: 'care-team-sharing', component: CareTeamSharing },
      { key: 'actions-logging', component: ActionsLogging },
      {
        key: 'commitments-summary',
        component: CommitmentsSummary,
        requiresAcknowledgement: true,
        primaryAction: {
          label: 'Valider',
          run: ({ signCharter }) => signCharter(),
          errorMessage: 'Une erreur est survenue lors de la validation de vos engagements. Veuillez réessayer.'
        }
      }
    ]
  },
  {
    key: 'handson',
    label: "Prendre en main l'outil",
    summary: 'Explorez l’outil au travers d’une prise en main guidée des fonctionnalités clés.',
    icon: FormatListBulletedIcon,
    screens: [
      {
        key: 'key-features',
        component: KeyFeatures,
        primaryAction: { label: 'Accéder à Cohort360' }
      }
    ]
  }
]

// Guards the progress ratio: an unknown or screenless step still counts as one slot.
export const getStepScreenCount = (stepIndex: number): number => ONBOARDING_STEPS[stepIndex]?.screens.length || 1

export const getScreenConfig = (stepIndex: number, screenIndex: number): OnboardingScreenConfig | undefined =>
  ONBOARDING_STEPS[stepIndex]?.screens[screenIndex]
