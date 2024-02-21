import { getProviders } from 'services/aphp/serviceProviders'
import { Direction, LabelObject, Order } from 'types/searchCriterias'

export const fetchUsers = async (searchInput?: string, signal?: AbortSignal): Promise<LabelObject[]> => {
  try {
    const { providers } = await getProviders(
      { orderBy: Order.LASTNAME, orderDirection: Direction.ASC },
      1,
      searchInput,
      signal
    )
    return providers.map((elem) => {
      return { label: `${elem.displayed_name} - ${elem.email}`, id: elem.provider_id }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
