import { Comparators } from 'types/requestCriterias'

export const comparatorToFilter = (comparator: Comparators) => {
  let filter = ''
  if (comparator) {
    switch (comparator) {
      case Comparators.LESS:
        filter = 'lt'
        break
      case Comparators.LESS_OR_EQUAL:
        filter = 'le'
        break
      case Comparators.EQUAL:
        filter = ''
        break
      case Comparators.GREATER:
        filter = 'gt'
        break
      case Comparators.GREATER_OR_EQUAL:
        filter = 'ge'
        break
      default:
        filter = ''
        break
    }
  }
  return filter
}

export const filterToComparator = (filter: string) => {
  if (filter.startsWith('lt')) {
    return Comparators.LESS
  } else if (filter.startsWith('le')) {
    return Comparators.LESS_OR_EQUAL
  } else if (filter.startsWith('gt')) {
    return Comparators.GREATER
  } else if (filter.startsWith('ge')) {
    return Comparators.GREATER_OR_EQUAL
  } else {
    return Comparators.EQUAL
  }
}

export const parseOccurence = (value: string) => {
  const match = value.match(/^(eq|lt|le|gt|ge)?(-?\d*\.?\d*)$/)
  if (match) {
    const [, comparator, number] = match
    const criterion = {
      comparator: comparator ? filterToComparator(comparator) : Comparators.GREATER_OR_EQUAL,
      value: parseFloat(number)
    }
    return criterion
  } else {
    const criterion = {
      comparator: Comparators.GREATER_OR_EQUAL,
      value: 1
    }
    return criterion
  }
}
