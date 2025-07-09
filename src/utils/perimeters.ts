import { SourceType } from 'types/scope'
import { Back_API_Response, CustomError } from 'types'
import { getConfig } from 'config'

export const getScopeLevelBySourceType = (type: SourceType) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  // TODO: Refactor this function to use an external mapping file/configuration
  const level0 = sourceTypeLevels[0]
  const level1 =
    sourceTypeLevels.length > 3 ? sourceTypeLevels[3] : sourceTypeLevels.length > 1 ? sourceTypeLevels[1] : level0
  const level2 = sourceTypeLevels.length > 5 ? sourceTypeLevels[5] : sourceTypeLevels[sourceTypeLevels.length - 1]
  switch (type) {
    case SourceType.APHP:
      return level0
    case SourceType.BIOLOGY:
    case SourceType.GHM:
    case SourceType.MEDICATION:
    case SourceType.DOCUMENT:
    case SourceType.IMAGING:
    case SourceType.MATERNITY:
    case SourceType.FORM_RESPONSE:
      return level1
    case SourceType.CCAM:
    case SourceType.CIM10:
    case SourceType.SUPPORTED:
    case SourceType.ALL:
      return level2
    default:
      return level2
  }
}

export const isSourceTypeInScopeLevel = (sourceType: SourceType, type: string) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  const scopeLevel = getScopeLevelBySourceType(sourceType)
  const sourceTypeIndex = sourceTypeLevels.find((level) => level === scopeLevel) ?? -1
  const typeIndex = sourceTypeLevels.find((level) => level === type) ?? -1
  if (typeIndex > sourceTypeIndex) return false
  return true
}

export const scopeLevelsToRequestParam = (sourceType: SourceType) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  const levels: string[] = []
  for (const element of sourceTypeLevels) {
    levels.push(element)
    if (element === getScopeLevelBySourceType(sourceType)) break
  }
  return levels.join(',')
}

export const isCustomError = <T>(response: Back_API_Response<T> | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}

export const perimeterDisplay = (source_value: string | null, name: string) => {
  return source_value ? `${source_value} - ${name}` : name
}
