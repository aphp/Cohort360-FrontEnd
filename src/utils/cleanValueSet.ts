import { ValueSet } from 'types'
import { displaySort } from './alphabeticalSort'
import { capitalizeFirstLetter } from './capitalize'

export const cleanValueSet = (valueSet: ValueSet[]): { id: string; label: string }[] => {
  if (valueSet && valueSet.length > 0) {
    const cleanData = valueSet.filter((value: ValueSet) => value.code !== 'APHP generated')

    return cleanData.sort(displaySort).map((_data: ValueSet) => ({
      id: _data.code,
      label: capitalizeFirstLetter(_data.display)
    }))
  } else return []
}
