import apiRequest from '../../services/apiRequest'
import { alphabeticalSort } from '../../utils/alphabeticalSort'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchGhmData = async (searchValue?: string) => {
  const _searchValue = searchValue ? `&_text=${searchValue}` : ''
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-ghm${_searchValue}`)

  const data =
    res && res.data && res.data.entry && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource.compose.include[0].concept
      : []

  return data && data.length > 0
    ? data.sort(alphabeticalSort).map((_data: { code: string; display: string }) => ({
        id: _data.code,
        label: capitalizeFirstLetter(_data.display)
      }))
    : []
}
