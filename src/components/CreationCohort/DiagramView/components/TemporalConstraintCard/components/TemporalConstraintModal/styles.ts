import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  avatar: {
    backgroundColor: '#5BC5F2',
    width: 20,
    height: 20,
    fontSize: 12,
    margin: '0 4px'
  },
  flexBaseline: {
    display: 'flex !important',
    marginTop: '8px !important'
  }
}))

export default useStyles
