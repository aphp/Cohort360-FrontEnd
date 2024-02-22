import services from 'services/aphp'
import { ProjectType } from 'types'
import { OrderBy } from 'types/searchCriterias'

export type FetchProjectsResponse = {
  count: number
  next: string | null
  previous: string | null
  results: ProjectType[]
}

export const fetchProjects = async (
  orderBy: OrderBy,
  limit: number = 5,
  offset: number = 0,
  text?: string,
  next?: string
): Promise<FetchProjectsResponse> => {
  try {
    const projects = (await services.projects.fetchProjectsList(orderBy, limit, offset, text, next)) || []
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
