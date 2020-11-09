import { makeStyles } from '@material-ui/core/styles'

export default makeStyles({
  text: {
    color: (isHeader) => (isHeader ? '#A3A6B4' : 'white'),
    paddingBottom: (isHeader) => (isHeader ? '6px' : '4px')
  }
})
