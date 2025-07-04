import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  title: {
    paddingTop: '80px',
    paddingBottom: '20px',
    width: '100%',
    borderBottom: '1px solid #D0D7D8',
    marginBottom: 36
  },
  validateButton: {
    width: '125px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    '&:hover': {
      backgroundColor: '#499cbf'
    },
    alignSelf: 'end',
    marginTop: 16
  },
  alert: {
    width: 500,
    position: 'fixed',
    bottom: 16,
    right: 50
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
}))

export default useStyles
