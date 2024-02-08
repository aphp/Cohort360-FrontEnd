import services from 'services/aphp'
import { ProjectType } from 'types'

export type FetchProjectsResponse = {
  count: number
  selectedProject: null
  projectsList: ProjectType[]
}

export const fetchProjects = async (limit: number = 5, offset: number = 0): Promise<FetchProjectsResponse> => {
  try {
    const projects = (await services.projects.fetchProjectsList(limit, offset)) || []
    return {
      count: projects.count,
      selectedProject: null,
      projectsList: projects.results
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      selectedProject: null,
      projectsList: []
    }
  }
}
