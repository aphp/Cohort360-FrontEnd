import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  exportDownloadDialog: {
    position: 'absolute',
    top: 50
  },
  exportDownloadProgress: {
    margin: '10%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 30
  }
}))

export default useStyles
