import { SourceType, SourceValue } from 'types/scope'
import { Back_API_Response, CustomError } from 'types'

export const getScopeLevelBySourceType = (type: SourceType) => {
  switch (type) {
    case SourceType.APHP:
      return SourceValue.APHP
    case SourceType.BIOLOGY:
    case SourceType.GHM:
    case SourceType.MEDICATION:
    case SourceType.DOCUMENT:
    case SourceType.IMAGING:
    case SourceType.MATERNITY:
      return SourceValue.HOPITAL
    case SourceType.CCAM:
    case SourceType.CIM10:
    case SourceType.SUPPORTED:
    case SourceType.FORM_RESPONSE:
    case SourceType.ALL:
      return SourceValue.UF
    default:
      return SourceValue.UF
  }
}

export const isSourceTypeInScopeLevel = (sourceType: SourceType, type: string) => {
  const scopeLevel = getScopeLevelBySourceType(sourceType)
  const allLevels = [
    SourceValue.APHP,
    SourceValue.GH,
    SourceValue.GHU,
    SourceValue.HOPITAL,
    SourceValue.POLE,
    SourceValue.UF
  ]
  const sourceTypeIndex = allLevels.find((level) => level === scopeLevel) ?? -1
  const typeIndex = allLevels.find((level) => level === type) ?? -1
  if (typeIndex > sourceTypeIndex) return false
  return true
}

export const scopeLevelsToRequestParam = (sourceType: SourceType) => {
  const levels: SourceValue[] = []
  const allLevels = [
    SourceValue.APHP,
    SourceValue.GH,
    SourceValue.GHU,
    SourceValue.HOPITAL,
    SourceValue.POLE,
    SourceValue.UF
  ]
  for (const element of allLevels) {
    levels.push(element)
    if (element === getScopeLevelBySourceType(sourceType)) break
  }
  return levels.join(',')
}

export const isCustomError = <T>(response: Back_API_Response<T> | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}
