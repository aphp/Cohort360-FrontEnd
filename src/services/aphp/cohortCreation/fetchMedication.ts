import apiFhir from '../../apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchSignleCode: (code: string) => Promise<string[]> = async (code: string) => {
  if (!code) return []
  const response = await apiFhir.get<any>(`/ConceptMap?_count=100&context=Descendant-leaf&source-code=${code}`)

  const data = getApiResponseResources(response)
  const codeList: string[] = []
  data?.forEach((resource: any) =>
    resource?.group?.forEach((group: { element: any[] }) =>
      group.element?.forEach((element) =>
        element?.target?.forEach((target: { code: any }) => codeList.push(target.code))
      )
    )
  )
  return codeList
}
