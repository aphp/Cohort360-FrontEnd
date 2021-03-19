import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state'
import { ScopeTreeRow } from 'types'

const self = (state: RootState) => state

const practitionerScopeSelector = createSelector(self, (state): ScopeTreeRow[] => {
  const organizations = state.me?.practitionerOrganizations

  if (!organizations) return []

  return organizations.map((orga) => ({
    id: orga.id ?? '',
    name: orga.name ?? '',
    quantity: orga.total,
    access: true
  }))
})

export { practitionerScopeSelector }
