import { Month } from 'types'
import moment from 'moment/moment'

export const isDateValid = (date?: string | null, format = 'YYYY-MM-DD') => {
  if (!date) return false
  return moment(date, format, true).isValid()
}

const formatDate = (date?: string, withHour?: boolean) => {
  const _date = moment(date)
  const format = `DD/MM/YYYY${withHour ? ' - HH:mm:ss' : ''}`
  return date && _date.isValid() ? _date.format(format) : 'N/A'
}

const getStringMonth = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 0:
      return Month.JANUARY
    case 1:
      return Month.FEBRUARY
    case 2:
      return Month.MARCH
    case 3:
      return Month.APRIL
    case 4:
      return Month.MAY
    case 5:
      return Month.JUNE
    case 6:
      return Month.JULY
    case 7:
      return Month.AUGUST
    case 8:
      return Month.SEPTEMBER
    case 9:
      return Month.OCTOBER
    case 10:
      return Month.NOVEMBER
    case 11:
      return Month.DECEMBER

    default:
      return
  }
}

const getStringMonthAphp = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 1:
      return Month.JANUARY
    case 2:
      return Month.FEBRUARY
    case 3:
      return Month.MARCH
    case 4:
      return Month.APRIL
    case 5:
      return Month.MAY
    case 6:
      return Month.JUNE
    case 7:
      return Month.JULY
    case 8:
      return Month.AUGUST
    case 9:
      return Month.SEPTEMBER
    case 10:
      return Month.OCTOBER
    case 11:
      return Month.NOVEMBER
    case 12:
      return Month.DECEMBER

    default:
      return
  }
}

const getDaysLeft = (date: Date): number => {
  return moment(date).diff(new Date(), 'days')
}

export { formatDate, getStringMonth, getStringMonthAphp, getDaysLeft }
