import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  inputContainer: {
    marginBottom: '24px'
  },
  requestList: {
    border: `1px solid #ccc`,
    borderRadius: 4,
    marginTop: 8,
    maxHeight: 650,
    minHeight: 300,
    overflow: 'auto',
    padding: '4px 8px'
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
