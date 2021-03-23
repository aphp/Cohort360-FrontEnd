import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state'

const self = (state: RootState) => state.accessRequests

export type AccessRequest = {
  author?: string
  date?: string
  perimeterAccess?: string
  comment?: string
  id: string
}

export const accessRequestsSelector = createSelector(self, (accessRequestsState): AccessRequest[] => {
  const { authors, practitionerRoles, organizations } = accessRequestsState
  const accessRequests: AccessRequest[] = []

  for (const { id, practitioner: authorRef, organization: organizationRef, meta } of practitionerRoles) {
    const author = authors.find((a) => authorRef?.reference === `Practitioner/${a.id}`)
    const organization = organizations.find((a) => organizationRef?.reference === `Organization/${a.id}`)

    if (!author || !organization || !id) {
      continue
    }

    const authorFullName = `${author.name?.[0]?.family} ${author.name?.[0]?.given?.[0]}`

    accessRequests.push({
      id,
      date: meta?.lastUpdated ?? '',
      perimeterAccess: organization.name,
      author: authorFullName
    })
  }

  return accessRequests
})
