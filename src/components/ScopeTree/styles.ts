import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  expandCell: {
    padding: '16px 4px 16px 16px'
  },
  checkbox: {
    padding: '8px 0'
  },
  secondRow: {
    background: '#f3f5f9'
  },
  expandIcon: {
    padding: '0 0 0 8px'
  },
  tableHead: {
    height: 42,
    backgroundColor: '#D1E2F4',
    textTransform: 'uppercase'
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF'
  },
  emptyTableHeadCell: {
    width: '42px',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0063AF',
    padding: 0
  }
}))

export default useStyles
