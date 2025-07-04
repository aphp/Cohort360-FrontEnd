import React from 'react'
import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import ViewListIcon from '@mui/icons-material/ViewList'
import { URLS } from 'types/exploration'

export const headerContexts: Record<string, { title: string; icon: React.ReactElement }> = {
  [URLS.PATIENTS]: {
    title: 'Tous mes patients',
    icon: <GroupIcon />
  },
  [URLS.COHORT]: {
    title: '',
    icon: <ViewListIcon />
  },
  [URLS.PERIMETERS]: {
    title: 'Exploration de périmètres',
    icon: <BusinessIcon />
  }
}
