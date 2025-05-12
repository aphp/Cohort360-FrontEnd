import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import useCohort from './useCohort'
import useProject from './useProject'
import useRequest from './useRequest'
import { cleanSearchParams } from 'utils/explorationUtils'

const useBreadCrumbs = () => {
  const { projectId, requestId, cohortId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const { project } = useProject(projectId)
  const { request } = useRequest(requestId)
  const { cohort } = useCohort(cohortId)
  const cleanedSearchParams = cleanSearchParams(searchParams)

  const items = []
  if (location.pathname.includes('/projects')) {
    items.push({ label: 'Tous mes projets', url: `/researches/projects?${cleanedSearchParams}` })

    if (projectId && project) {
      items.push({
        label: `${project.name}`,
        url: `/researches/projects/${projectId}`
      })

      if (requestId && request) {
        items.push({
          label: `${request.name}`,
          url: `/researches/projects/${projectId}/${requestId}`
        })

        if (cohortId && cohort) {
          items.push({
            label: `${cohort?.name}`,
            url: `/researches/projects/${projectId}/${requestId}/${cohortId}`
          })
        }
      }
    }
  }

  if (location.pathname.includes('/requests')) {
    items.push({ label: 'Toutes mes requêtes', url: `/researches/requests?${cleanedSearchParams}` })
    if (requestId && request) {
      items.push({
        label: `${request.name}`,
        url: `/researches/requests/${requestId}`
      })

      if (cohortId && cohort) {
        items.push({
          label: `${cohort?.name}`,
          url: `/researches/requests/${requestId}/${cohortId}`
        })
      }
    }
  }

  if (location.pathname.includes('/cohorts')) {
    items.push({ label: 'Toutes mes cohortes', url: `/researches/cohorts?${cleanedSearchParams}` })

    if (cohortId && cohort) {
      items.push({
        label: `${cohort?.name}`,
        url: `/researches/cohorts/${cohortId}`
      })
    }
  }

  if (location.pathname.includes('/samples')) {
    items.push({ label: 'Tous mes échantillons', url: `/researches/samples?${cleanedSearchParams}` })
  }

  return items
}

export default useBreadCrumbs
