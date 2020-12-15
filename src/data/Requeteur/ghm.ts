import apiRequest from '../../services/apiRequest'
import { alphabeticalSort } from '../../utils/alphabeticalSort'

export const fetchGhmData = async (searchValue?: string) => {
  if (searchValue) {
    const res = await apiRequest.get(`/ValueSet?_text=${searchValue}&url=https://terminology.eds.aphp.fr/aphp-ghm`)

    const ghmList =
      res && res.data && res.data.entry && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource.compose.include[0].concept
        : []

    return ghmList.sort(alphabeticalSort)
  }

  return []
}
