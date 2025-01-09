import { useLocation, useParams } from 'react-router-dom'
import useProject from './useProject'
import useRequest from './useRequest'

const useBreadCrumb = () => {
  const { projectId, requestId, cohortId } = useParams()
  const location = useLocation()

  const { project } = useProject(projectId)
  const { request } = useRequest(requestId)
  // TODO: same with cohorts

  const items = []
  if (location.pathname.includes('/projects')) {
    items.push({ label: 'Tous mes projets', url: '/researches/projects' })

    if (projectId && project) {
      items.push({
        label: `Projet ${project.name}`,
        url: `/researches/projects/${projectId}`
      })

      if (requestId && request) {
        items.push({
          label: `Requête ${request.name}`,
          url: `/researches/projects/${projectId}/${requestId}`
        })
      }
    }
  }

  if (location.pathname.includes('/requests')) {
    items.push({ label: 'Requêtes', url: '/researches/requests' })
    if (requestId && request) {
      items.push({
        label: `Requête ${request.name}`,
        url: `/researches/${requestId}`
      })
    }
  }

  if (location.pathname.includes('/cohorts')) {
    items.push({ label: 'Mes Cohortes', url: '/researches/requests' })
    // TODO: a adapter
  }
  return items
}

export default useBreadCrumb
