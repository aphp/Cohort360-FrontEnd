import { useEffect, useState } from 'react'

import serviceOnboarding from 'services/aphp/serviceOnboarding'
import type { MyAccess, MyAccessRole, RightCatalogCategory } from 'types'

export type UserAccess = {
  id: number
  perimeter: string
  profile: string
  rights: string[]
  expirationDate?: Date
}

type FlatRight = [name: string, label: string]

const flattenCatalog = (catalog: RightCatalogCategory[]): FlatRight[] =>
  catalog.flatMap((category) => category.rights.map((right): FlatRight => [right.name, right.label]))

const grantedRightsLabels = (role: MyAccessRole, catalog: FlatRight[]): string[] =>
  catalog.filter(([key]) => role[key] === true).map(([, label]) => label)

const toUserAccess = (access: MyAccess, catalog: FlatRight[]): UserAccess => ({
  id: access.id,
  perimeter: access.perimeter ? `${access.perimeter.source_value} - ${access.perimeter.name}` : '',
  profile: access.role?.name ?? '',
  rights: access.role ? grantedRightsLabels(access.role, catalog) : [],
  expirationDate: access.end_datetime ? new Date(access.end_datetime) : undefined
})

type UserAccessesState = {
  loading: boolean
  hasError: boolean
  accesses: UserAccess[]
}

// Profile is the habilitation name and rights are labelled from the catalog, to mirror the admin portal.
export const useUserAccesses = (): UserAccessesState => {
  const [accesses, setAccesses] = useState<UserAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([serviceOnboarding.getMyAccesses(), serviceOnboarding.getRightsCatalog()])
      .then(([myAccesses, catalog]) => {
        if (active) {
          const flatCatalog = flattenCatalog(catalog)
          setAccesses(myAccesses.map((access) => toUserAccess(access, flatCatalog)))
        }
      })
      .catch(() => {
        if (active) {
          setHasError(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { loading, hasError, accesses }
}
