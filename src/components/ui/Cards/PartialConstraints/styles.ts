import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 200,
    width: 800,
    margin: '1em'
  },
  cardHeader: {
    backgroundColor: '#D1E2F4',
    width: 'inherit'
  }
}))

export default useStyles
