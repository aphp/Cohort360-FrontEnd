import { CONTEXT, CONDITION_HIERARCHY, CONDITION_STATUS } from '../../constants'
import apiRequest from 'services/apiRequest'
import { capitalizeFirstLetter } from 'utils/capitalize'
import {
  fakeValueSetDiagnosticType,
  fakeValueSetCIM10
  // fakeHierarchyCIM10
} from 'data/fakeData/cohortCreation/condition'
import { codeSort } from 'utils/alphabeticalSort'

const DEFAULT_DIAGNOSTIC_TYPES = [
  {
    code: 'mp',
    display: 'manifestation morbide principale'
  },
  {
    code: 'fp',
    display: 'finalité principale de prise en charge'
  },
  {
    code: 'dp',
    display: 'diagnostic principal'
  },
  {
    code: 'das',
    display: 'diagnostic associé significatif'
  },
  {
    code: 'dr',
    display: 'diagnostic relié'
  },
  {
    code: 'ae',
    display: 'affection étiologique'
  },
  {
    code: 'dad',
    display: 'donnée à visée documentaire'
  }
]

export const fetchStatusDiagnostic = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    const res = [
      {
        id: 'actif',
        label: 'Actif'
      },
      {
        id: 'supp',
        label: 'Supprimé'
      }
    ]
    return res
  } else {
    const res = [
      {
        id: 'actif',
        label: 'Actif'
      },
      {
        id: 'supp',
        label: 'Supprimé'
      }
    ]
    return res
  }
}

export const fetchDiagnosticTypes = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetDiagnosticType && fakeValueSetDiagnosticType.length > 0
      ? fakeValueSetDiagnosticType.map((_fakeValueSetDiagnosticType: { code: string; display: string }) => ({
          id: _fakeValueSetDiagnosticType.code,
          label: capitalizeFirstLetter(_fakeValueSetDiagnosticType.display)
        }))
      : []
  } else {
    const res = await apiRequest.get<any>(`/ValueSet?url=${CONDITION_STATUS}`)

    const diagnosticKinds =
      res && res.data && res.data.entry && res.data.entry[0]
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : DEFAULT_DIAGNOSTIC_TYPES

    return diagnosticKinds && diagnosticKinds.length > 0
      ? diagnosticKinds.sort(codeSort).map((cimType: any) => ({
          id: cimType.code,
          label: `${cimType.code} - ${cimType.display}`
        }))
      : []
  }
}

// todo: check if the data syntax is correct when available
export const fetchCim10Diagnostic = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetCIM10 && fakeValueSetCIM10.length > 0
      ? fakeValueSetCIM10.map((_fakeValueSetCIM10: { code: string; display: string }) => ({
          id: _fakeValueSetCIM10.code,
          label: capitalizeFirstLetter(_fakeValueSetCIM10.display)
        }))
      : []
  } else {
    if (!searchValue) {
      return []
    }
    const _searchValue = noStar
      ? searchValue
        ? `&code=${searchValue.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
        : ''
      : searchValue
      ? `&_text=${searchValue.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}*` //eslint-disable-line
      : ''

    const res = await apiRequest.get<any>(`/ValueSet?url=${CONDITION_HIERARCHY}${_searchValue}&size=0`)

    let cim10List =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(codeSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`
          }))
        : []
    return cim10List
  }
}

export const fetchCim10Hierarchy = async (cim10Parent: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    if (!cim10Parent) {
      const res = await apiRequest.get<any>(`/ValueSet?url=${CONDITION_HIERARCHY}`)

      let cim10List =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource?.compose?.include[0].concept
          : []

      cim10List =
        cim10List && cim10List.length > 0
          ? cim10List.sort(codeSort).map((cimData: any) => ({
              id: cimData.code,
              label: `${cimData.code} - ${cimData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return cim10List
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: CONDITION_HIERARCHY,
        compose: {
          include: [
            {
              filter: [
                {
                  op: 'is-a',
                  value: cim10Parent ?? ''
                }
              ]
            }
          ]
        }
      }

      const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

      let cim10List =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      cim10List =
        cim10List && cim10List.length > 0
          ? cim10List.sort(codeSort).map((cimData: any) => ({
              id: cimData.code,
              label: `${cimData.code} - ${cimData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return cim10List
    }
  }
}
