import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import useProject from './useProject'
import useRequest from './useRequest'
import { cleanSearchParams } from 'utils/explorationUtils'

const useBreadCrumbs = () => {
  const { projectId, requestId, cohortId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const { project } = useProject(projectId)
  const { request } = useRequest(requestId)
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
      }
    }
  }

  if (location.pathname.includes('/requests')) {
    items.push({ label: 'Toutes mes requêtes', url: `/researches/requests?${cleanedSearchParams}` })
    if (requestId && request) {
      items.push({
        label: `${request.name}`,
        url: `/researches/${requestId}`
      })
    }
  }

  if (location.pathname.includes('/cohorts')) {
    items.push({ label: 'Toutes mes cohortes', url: '/researches/requests' })
    // TODO: a adapter
  }
  return items
}

export default useBreadCrumbs
