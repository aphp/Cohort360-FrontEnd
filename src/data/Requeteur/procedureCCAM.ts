import apiRequest from './apiRequest'
import { alphabeticalSort } from '../../utils/alphabeticalSort'

export const fetchCcamData = async (searchValue?: string) => {
  if (searchValue) {
    const res = await apiRequest.get(
      `/ValueSet?_text=${searchValue}&url=https://terminology.eds.aphp.fr/aphp-orbis-ccam`
    )

    const CCAMObject = res && res.data && res.data.entry && res.data.resourceType === 'Bundle' ? res.data.entry : []

    const CCAMList =
      CCAMObject && CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM')
        ? CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM').resource.compose.include[0].concept
        : []

    return CCAMList.sort(alphabeticalSort)
  }

  return []
}
