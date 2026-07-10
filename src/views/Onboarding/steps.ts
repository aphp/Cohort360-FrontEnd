import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import type { SvgIconProps } from '@mui/material'
import type { ComponentType } from 'react'
import type { AppDispatch } from 'state'
import { signCharter } from 'state/onboarding'

import ActionsLogging from './screens/commitments/ActionsLogging'
import CareTeamSharing from './screens/commitments/CareTeamSharing'
import CharterConfirmation from './screens/commitments/CharterConfirmation'
import CharterSignature from './screens/commitments/CharterSignature'
import DataCrossing from './screens/commitments/DataCrossing'
import DataDeletion from './screens/commitments/DataDeletion'
import MinimalDataUse from './screens/commitments/MinimalDataUse'
import UsagePurposes from './screens/commitments/UsagePurposes'
import UsageRules from './screens/commitments/UsageRules'
import DataAccess from './screens/environment/DataAccess'
import UserRights from './screens/environment/UserRights'
import WhatIsCohort360 from './screens/environment/WhatIsCohort360'
import WhatIsEds from './screens/environment/WhatIsEds'

/**
 * Replaces the default `Continuer` button on a screen. It runs before the journey moves on:
 * a rejection leaves the user where they are, with the error surfaced by the store.
 */
export type OnboardingPrimaryAction = {
  label: string
  run: (dispatch: AppDispatch) => Promise<unknown>
  /** Shown instead of the generic progress-saving error when `run` rejects. */
  errorMessage?: string
}

export type OnboardingScreenConfig = {
  key: string
  component: ComponentType
  /** Displays the responsibility banner above the card. */
  showWarningBanner?: boolean
  /** `bare` drops the white card, for screens bringing their own container. */
  layout?: 'card' | 'bare'
  primaryAction?: OnboardingPrimaryAction
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
    summary: 'Apprenez-en plus sur ce qu’est Cohort360 et sur vos accès aux données dans l’outil.',
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
      { key: 'actions-logging', component: ActionsLogging, showWarningBanner: true },
      { key: 'care-team-sharing', component: CareTeamSharing, showWarningBanner: true },
      { key: 'data-crossing', component: DataCrossing },
      { key: 'minimal-data-use', component: MinimalDataUse },
      { key: 'usage-purposes', component: UsagePurposes },
      { key: 'data-deletion', component: DataDeletion, showWarningBanner: true },
      {
        key: 'charter-signature',
        component: CharterSignature,
        layout: 'bare',
        primaryAction: {
          label: 'Signer',
          run: (dispatch) => dispatch(signCharter()).unwrap(),
          errorMessage: 'Une erreur est survenue lors de la signature de la charte. Veuillez réessayer.'
        }
      },
      { key: 'charter-confirmation', component: CharterConfirmation }
    ]
  },
  {
    key: 'handson',
    label: "Prendre en main l'outil",
    summary: 'Explorez l’outil au travers d’une prise en main guidée de 3 fonctionnalités clés.',
    icon: FormatListBulletedIcon,
    screens: []
  }
]

// A step with no screen yet still occupies one slot in the journey, hence the floor at 1.
export const getStepScreenCount = (stepIndex: number): number => ONBOARDING_STEPS[stepIndex]?.screens.length || 1

export const getScreenConfig = (stepIndex: number, screenIndex: number): OnboardingScreenConfig | undefined =>
  ONBOARDING_STEPS[stepIndex]?.screens[screenIndex]
