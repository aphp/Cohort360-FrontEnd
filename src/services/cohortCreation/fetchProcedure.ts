import apiRequest from '../../services/apiRequest'
import { alphabeticalSort } from '../../utils/alphabeticalSort'

export const fetchCcamData = async (searchValue?: string) => {
  const _searchValue = searchValue ? `&_text=${searchValue}` : ''

  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-ccam${_searchValue}`)

  const CCAMObject = res && res.data && res.data.entry && res.data.resourceType === 'Bundle' ? res.data.entry : []

  const CCAMList =
    CCAMObject && CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM')
      ? CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM').resource.compose.include[0].concept
      : []

  return (
    CCAMList.sort(alphabeticalSort).map((ccamData: any) => ({
      id: ccamData.code,
      label: `${ccamData.code} - ${ccamData.display}`
    })) || []
  )
}
