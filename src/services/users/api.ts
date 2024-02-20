import { getProviders } from 'services/aphp/serviceProviders'
import { Direction, Order } from 'types/searchCriterias'

export const fetchUsers = async (
  searchInput?: string,
  signal?: AbortSignal
): Promise<any> => {
  try {
    const { providers } = await getProviders(
      { orderBy: Order.LASTNAME, orderDirection: Direction.ASC },
      1,
      searchInput,
      signal
    )
    return {
      count: providers.count,
      requestsList: providers.results
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      requestsList: []
    }
  }
}
