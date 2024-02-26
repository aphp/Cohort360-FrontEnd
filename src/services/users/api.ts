import { getUsers } from 'services/aphp/serviceUsers'
import { Direction, LabelObject, Order } from 'types/searchCriterias'

export const fetchUsers = async (searchInput?: string, signal?: AbortSignal): Promise<LabelObject[]> => {
  try {
    const { users } = await getUsers({ orderBy: Order.LASTNAME, orderDirection: Direction.ASC }, 1, searchInput, signal)
    return users.map((elem) => {
      return { label: `${elem.display_name} - ${elem.email}`, id: elem.username || '' }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
