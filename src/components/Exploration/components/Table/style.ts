import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  table: {
    minWidth: 650
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF',
    padding: '0 20px'
  },
  multiple: {
    '&::after': {
      content: "'/'",
      padding: '0 4px'
    },
    '&:last-child::after': {
      content: "''",
      padding: 0
    }
  },
  tableHeadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0,
    top: 2,
    position: 'relative'
  }
}))

export default useStyles
