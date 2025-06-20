import React from 'react'
import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import ViewListIcon from '@mui/icons-material/ViewList'
import { URLS } from 'types/exploration'

type ContextConfig = {
  title: string
  icon: React.ReactElement
  showActions: boolean
  hasPerimeters?: boolean
}

export const headerContexts: Record<string, ContextConfig> = {
  [URLS.PATIENTS]: {
    title: 'Tous mes patients',
    icon: <GroupIcon />,
    showActions: false
  },
  [URLS.COHORT]: {
    title: '',
    icon: <ViewListIcon />,
    showActions: true
  },
  [URLS.PERIMETERS]: {
    title: 'Exploration de périmètres',
    icon: <BusinessIcon />,
    showActions: false,
    hasPerimeters: true
  }
}
