export type SearchInputError = {
  isError: boolean
  errorsDetails?: ErrorDetails[]
}

export type ErrorDetails = {
  errorName?: string
  errorPositions?: number[]
  errorSolution?: string
}

export type ErrorType = { isError: boolean; errorMessage?: string }
