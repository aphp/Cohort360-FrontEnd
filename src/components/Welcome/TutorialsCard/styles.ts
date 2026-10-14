import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  divider: {
    marginBottom: '15px'
  },
  video: {
    display: 'block',
    width: '100%',
    height: 360
  }
}))

export default useStyles
