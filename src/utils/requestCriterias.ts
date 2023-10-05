import moment from 'moment'
import { VitalStatusLabel } from 'types/requestCriterias'
import { DurationRangeType, VitalStatus } from 'types/searchCriterias'

export const getVitalStatusLabel = (value: VitalStatus) => {
  switch (value) {
    case VitalStatus.ALIVE:
      return VitalStatusLabel.ALIVE
    case VitalStatus.DECEASED:
      return VitalStatusLabel.DECEASED
    default:
      return VitalStatusLabel.ALL
  }
}

export const getGenders = (values: { id: string; label: string }[]) => {
  const labels = values.map((value) => value.label)
  const concatenatedLabels = labels.join(' - ')
  return concatenatedLabels
}

export const getBirthdates = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Naissance entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format(
      'DD/MM/YYYY'
    )}`
  }
  if (values[0] && !values[1]) {
    return `Naissance à partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Naissance jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}

export const getDeathDates = (values: DurationRangeType) => {
  if (values[0] && values[1]) {
    return `Décès entre le ${moment(values[0]).format('DD/MM/YYYY')} et le ${moment(values[1]).format('DD/MM/YYYY')}`
  }
  if (values[0] && !values[1]) {
    return `Décès à partir du ${moment(values[0]).format('DD/MM/YYYY')}`
  }
  if (!values[0] && values[1]) {
    return `Décès jusqu'au ${moment(values[1]).format('DD/MM/YYYY')}`
  }
}
