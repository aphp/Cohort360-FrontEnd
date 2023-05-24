import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  button: {
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    '&:hover': {
      backgroundColor: '#499cbf',
      color: '#FFF'
    },
    marginBottom: 4
  }
}))

export default useStyles
