import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  expandCell: {
    padding: '16px 4px 16px 16px'
  },
  expandIcon: {
    padding: '0'
  },
  checkbox: {
    padding: '8px 0'
  },
  tabs: {
    width: '100%'
  },
  searchBar: {
    marginBottom: '0px'
  },
  mainRow: {},
  secondRow: {
    background: '#f3f5f9'
  }
}))

export default useStyles
