import { Direction, OrderBy } from 'types/searchCriterias'
import apiBack from '../apiBackend'
import { Back_API_Response, User } from 'types'

export const getUsers = async (orderBy: OrderBy, page?: number, searchInput?: string) => {
  const searchFilter = searchInput ? `&search=${searchInput}` : ''

  const usersResp = await apiBack.get<Back_API_Response<User>>(
    `/users/?manual_only=true&page=${page}&ordering=${orderBy.orderDirection === Direction.DESC ? '-' : ''}${
      orderBy.orderBy
    }${searchFilter}`
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
