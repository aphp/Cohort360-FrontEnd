import { Direction, OrderBy } from 'types/searchCriterias'
import apiBack from '../apiBackend'

export const getProviders = async (orderBy: OrderBy, page?: number, searchInput?: string) => {
  const searchFilter = searchInput ? `&search=${searchInput}` : ''

  const providersResp = await apiBack.get<any>(
    `/users/?manual_only=true&page=${page}&ordering=${orderBy.orderDirection === Direction.DESC ? '-' : ''}${
      orderBy.orderBy
    }${searchFilter}`
  )

  if (providersResp.status === 200) {
    return {
      providers: providersResp.data.results ?? undefined,
      total: providersResp.data.count ?? 0
    }
  } else {
    return {
      providers: undefined,
      total: 0
    }
  }
}
