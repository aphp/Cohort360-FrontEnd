import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0
  },
  typographyMargin: {
    margin: '0 8px'
  }
}))

export default useStyles
