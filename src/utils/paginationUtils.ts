export const getCleanGroupId = (groupId: string | null) => {
  if (groupId === null) return undefined
  const cleanGroupId = groupId.split(',').filter((value) => !!value && RegExp(/^\d+$/).exec(value))

  return cleanGroupId.length > 0 ? cleanGroupId.join() : undefined
}

type cleanSearchParamsProps = {
  page: string
  tabId?: string
  groupId?: string
}
export const cleanSearchParams = (params: cleanSearchParamsProps) => {
  const { page, tabId, groupId } = params
  return {
    ...(groupId && getCleanGroupId(groupId) && { groupId: getCleanGroupId(groupId) }),
    page: page,
    ...(tabId && { tabId })
  }
}
