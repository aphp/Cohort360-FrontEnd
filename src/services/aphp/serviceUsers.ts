import { Direction, OrderBy } from 'types/searchCriterias'
import apiBack from '../apiBackend'
import { Back_API_Response, User } from 'types'

type UsersRequest = {
  users: User[],
  total: number
}

export const getUsers = async (orderBy: OrderBy, page?: number, searchInput?: string, signal?: AbortSignal): Promise<UsersRequest> => {
  const searchFilter = searchInput ? `&search=${searchInput}` : ''

  const usersResp = await apiBack.get<Back_API_Response<User>>(
    `/users/?manual_only=true&page=${page}&ordering=${orderBy.orderDirection === Direction.DESC ? '-' : ''}${
      orderBy.orderBy
    }${searchFilter}`, {signal: signal}
  )

  if (usersResp.status === 200) {
    return {
      users: usersResp.data.results ?? [],
      total: usersResp.data.count ?? 0
    }
  } else {
    return {
      users: [],
      total: 0
    }
  }
}
