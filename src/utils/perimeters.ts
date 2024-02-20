import { CustomError, ScopePage } from 'types'

export const isCustomError = (response: ScopePage[] | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}
