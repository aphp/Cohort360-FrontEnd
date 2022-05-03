import apiBack from '../apiBackend'

import { Order } from 'types'

export const getProviders = async (order: Order, page?: number, searchInput?: string) => {
  const searchFilter = searchInput ? `&search=${searchInput}` : ''

  const providersResp = await apiBack.get<any>(
    `/providers/?manual_only=true&page=${page}&ordering=${order.orderDirection === 'desc' ? '-' : ''}${
      order.orderBy
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
