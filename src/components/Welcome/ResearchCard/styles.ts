import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  tableContainer: {
    marginTop: '16px'
  },
  link: {
    color: '#5BC5F2',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  }
}))

export default useStyles
