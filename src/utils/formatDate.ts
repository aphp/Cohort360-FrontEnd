import { Month } from 'types'

const getFormatedDate = (date: Date) => {
  const mm = date.getMonth() + 1 // getMonth() is zero-based
  const dd = date.getDate()

  return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-')
}

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

export { getFormatedDate, getStringMonth, getStringMonthAphp }
