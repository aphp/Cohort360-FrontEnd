import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  requestList: {
    border: `1px solid #ccc`,
    borderRadius: 4,
    marginTop: 8,
    maxHeight: 650,
    minHeight: 300,
    maxWidth: '100%',
    padding: '4px 8px',
    overflowY: 'auto'
  },
  requestItem: {
    borderBottom: `1px solid #cccccccc`,
    cursor: 'pointer',
    '&:last-child': {
      borderBottom: 'none'
    }
  }
}))

export default useStyles
