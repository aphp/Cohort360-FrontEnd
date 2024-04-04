import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
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
