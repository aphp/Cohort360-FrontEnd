import services from 'services/aphp'
import { ProjectType } from 'types'
import { OrderBy } from 'types/searchCriterias'

export type FetchProjectsOptions = {
  orderBy: OrderBy
  limit: number
  text?: string
  next?: string
}

export type FetchProjectsResponse = {
  count: number
  next: string | null
  previous: string | null
  results: ProjectType[]
}

export const fetchProjects = async (options: FetchProjectsOptions): Promise<FetchProjectsResponse> => {
  try {
    const projects = (await services.projects.fetchProjectsList(options)) || []
    return projects
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      results: [],
      next: null,
      previous: null
    }
  }
}
