export type SearchInputError = {
  isError: boolean
  errorsDetails?: ErrorDetails[]
}

export type ErrorDetails = {
  errorName?: string
  errorPositions?: number[]
  errorSolution?: string
}
