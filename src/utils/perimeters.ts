import { Back_API_Response, CustomError } from 'types'

export const isCustomError = <T>(response: Back_API_Response<T> | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}
