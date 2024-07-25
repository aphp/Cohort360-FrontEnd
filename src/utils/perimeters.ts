import { SourceType } from 'types/scope'
import { Back_API_Response, CustomError } from 'types'
import { PERIMETER_SOURCE_TYPE_HIERARCHY } from 'constants.js'

const SOURCE_TYPES_LEVELS: string[] = PERIMETER_SOURCE_TYPE_HIERARCHY.split(',')

export const getScopeLevelBySourceType = (type: SourceType) => {
  // TODO: Refactor this function to use an external mapping file/configuration
  const level0 = SOURCE_TYPES_LEVELS[0]
  const level1 =
    SOURCE_TYPES_LEVELS.length > 3
      ? SOURCE_TYPES_LEVELS[3]
      : SOURCE_TYPES_LEVELS.length > 1
      ? SOURCE_TYPES_LEVELS[1]
      : level0
  const level2 =
    SOURCE_TYPES_LEVELS.length > 5 ? SOURCE_TYPES_LEVELS[5] : SOURCE_TYPES_LEVELS[SOURCE_TYPES_LEVELS.length - 1]
  switch (type) {
    case SourceType.APHP:
      return level0
    case SourceType.BIOLOGY:
    case SourceType.GHM:
    case SourceType.MEDICATION:
    case SourceType.DOCUMENT:
    case SourceType.IMAGING:
    case SourceType.MATERNITY:
      return level1
    case SourceType.CCAM:
    case SourceType.CIM10:
    case SourceType.SUPPORTED:
    case SourceType.FORM_RESPONSE:
    case SourceType.ALL:
      return level2
    default:
      return level2
  }
}

export const isSourceTypeInScopeLevel = (sourceType: SourceType, type: string) => {
  const scopeLevel = getScopeLevelBySourceType(sourceType)
  const sourceTypeIndex = SOURCE_TYPES_LEVELS.find((level) => level === scopeLevel) ?? -1
  const typeIndex = SOURCE_TYPES_LEVELS.find((level) => level === type) ?? -1
  if (typeIndex > sourceTypeIndex) return false
  return true
}

export const scopeLevelsToRequestParam = (sourceType: SourceType) => {
  const levels: string[] = []
  for (const element of SOURCE_TYPES_LEVELS) {
    levels.push(element)
    if (element === getScopeLevelBySourceType(sourceType)) break
  }
  return levels.join(',')
}

export const isCustomError = <T>(response: Back_API_Response<T> | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}
