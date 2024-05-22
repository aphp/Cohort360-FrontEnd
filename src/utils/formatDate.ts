import { Month } from 'types'
import moment from 'moment/moment'

const getStringMonth = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 0:
      return Month.january
    case 1:
      return Month.february
    case 2:
      return Month.march
    case 3:
      return Month.april
    case 4:
      return Month.may
    case 5:
      return Month.june
    case 6:
      return Month.july
    case 7:
      return Month.august
    case 8:
      return Month.september
    case 9:
      return Month.october
    case 10:
      return Month.november
    case 11:
      return Month.december

    default:
      return
  }
}

const getStringMonthAphp = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 1:
      return Month.january
    case 2:
      return Month.february
    case 3:
      return Month.march
    case 4:
      return Month.april
    case 5:
      return Month.may
    case 6:
      return Month.june
    case 7:
      return Month.july
    case 8:
      return Month.august
    case 9:
      return Month.september
    case 10:
      return Month.october
    case 11:
      return Month.november
    case 12:
      return Month.december

    default:
      return
  }
}

const getDaysLeft = (date: Date): number => {
  return moment(date).diff(new Date(), 'days')
}

export { getStringMonth, getStringMonthAphp, getDaysLeft }
